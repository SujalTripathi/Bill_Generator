import Invoice from '../models/Invoice.model.js';
import BusinessProfile from '../models/BusinessProfile.model.js';
import Customer from '../models/Customer.model.js';
import User from '../models/User.model.js';
import { calculateBillTotals } from '../utils/billCalculator.js';
import { generateInvoiceNumber, getCurrentFinancialYear } from '../utils/invoiceNumberGenerator.js';
import { parseInvoiceWithAI } from '../services/gemini.service.js';
import { nanoid } from 'nanoid';

// POST /api/invoices/parse — AI parse text, return structured JSON
export const parseWithAI = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Text input is required' });
    }

    const parsed = await parseInvoiceWithAI(text);

    // If user has a business profile, get seller state for calculations
    const profile = await BusinessProfile.findOne({ userId: req.user._id });
    let calculatedData = null;

    if (profile && parsed.items.length > 0 && parsed.buyer?.state) {
      calculatedData = calculateBillTotals(
        parsed.items,
        profile.state || '',
        parsed.buyer.state || ''
      );
    }

    res.json({
      success: true,
      parsed,
      calculated: calculatedData,
      aiInputText: text,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/invoices — Save invoice
export const createInvoice = async (req, res, next) => {
  try {
    const profile = await BusinessProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(400).json({ success: false, message: 'Please set up your business profile first' });
    }

    const currentFY = getCurrentFinancialYear(req.body.invoiceDate);

    // Reset counter if FY changed
    if (profile.currentFinancialYear !== currentFY) {
      profile.currentFinancialYear = currentFY;
      profile.lastInvoiceNumber = 0;
    }

    // Generate invoice number
    const { invoiceNumber, sequenceNumber } = generateInvoiceNumber(
      profile.invoicePrefix,
      profile.lastInvoiceNumber,
      req.body.invoiceDate
    );

    // Calculate totals
    const sellerState = profile.state || '';
    const buyerState = req.body.buyer?.state || '';
    const totals = calculateBillTotals(req.body.items || [], sellerState, buyerState);

    // Build seller snapshot
    const seller = {
      businessName: profile.businessName,
      gstin: profile.gstin,
      address: [profile.addressLine1, profile.addressLine2].filter(Boolean).join(', '),
      city: profile.city,
      state: profile.state,
      stateCode: profile.stateCode,
      phone: profile.phone,
      email: profile.email,
      logoUrl: profile.logoUrl,
    };

    const publicToken = nanoid(12);

    const invoice = await Invoice.create({
      userId: req.user._id,
      businessProfileId: profile._id,
      invoiceNumber,
      billType: req.body.billType || 'TAX INVOICE',
      invoiceDate: req.body.invoiceDate || new Date(),
      dueDate: req.body.dueDate,
      seller,
      buyer: req.body.buyer,
      shippingAddress: req.body.shippingAddress || {},
      items: totals.items,
      isInterState: totals.isInterState,
      placeOfSupply: req.body.placeOfSupply || buyerState,
      subtotal: totals.subtotal,
      totalDiscount: totals.totalDiscount,
      totalTaxable: totals.totalTaxable,
      totalCGST: totals.totalCGST,
      totalSGST: totals.totalSGST,
      totalIGST: totals.totalIGST,
      totalCess: totals.totalCess,
      totalTax: totals.totalTax,
      roundOff: totals.roundOff,
      grandTotal: totals.grandTotal,
      amountInWords: totals.amountInWords,
      customFields: req.body.customFields || [],
      notes: req.body.notes || profile.defaultNotes || '',
      termsAndConditions: req.body.termsAndConditions || profile.defaultTerms || '',
      status: req.body.status || 'draft',
      publicToken,
      aiInputText: req.body.aiInputText || '',
    });

    // Update business profile counter
    profile.lastInvoiceNumber = sequenceNumber;
    await profile.save();

    // Increment user invoice count
    await User.findByIdAndUpdate(req.user._id, { $inc: { invoiceCount: 1 } });

    // Update customer totals if buyer exists in customers
    if (req.body.buyer?.name) {
      await Customer.findOneAndUpdate(
        { userId: req.user._id, name: req.body.buyer.name },
        {
          $inc: { totalInvoices: 1, totalAmount: totals.grandTotal },
          $setOnInsert: {
            userId: req.user._id,
            name: req.body.buyer.name,
            gstin: req.body.buyer.gstin || '',
            phone: req.body.buyer.phone || '',
            email: req.body.buyer.email || '',
            addressLine1: req.body.buyer.addressLine1 || '',
            city: req.body.buyer.city || '',
            state: req.body.buyer.state || '',
            stateCode: req.body.buyer.stateCode || '',
          },
        },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({ success: true, invoice });
  } catch (error) {
    next(error);
  }
};

// GET /api/invoices — List with pagination, search, filters
export const getInvoices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id, status: { $ne: 'cancelled' } };

    // Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { invoiceNumber: searchRegex },
        { 'buyer.name': searchRegex },
      ];
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by bill type
    if (req.query.billType) {
      query.billType = req.query.billType;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.invoiceDate = {};
      if (req.query.startDate) query.invoiceDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.invoiceDate.$lte = new Date(req.query.endDate);
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-items -customFields -notes -termsAndConditions -aiInputText'),
      Invoice.countDocuments(query),
    ]);

    res.json({
      success: true,
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/invoices/stats
export const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [totals, statusCounts, monthlyRevenue, topCustomers] = await Promise.all([
      Invoice.aggregate([
        { $match: { userId, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$grandTotal' },
            totalInvoices: { $sum: 1 },
          },
        },
      ]),

      Invoice.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      Invoice.aggregate([
        {
          $match: {
            userId,
            status: { $ne: 'cancelled' },
            invoiceDate: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$invoiceDate' },
              month: { $month: '$invoiceDate' },
            },
            revenue: { $sum: '$grandTotal' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      Invoice.aggregate([
        { $match: { userId, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: '$buyer.name',
            totalAmount: { $sum: '$grandTotal' },
            invoiceCount: { $sum: 1 },
          },
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const statusMap = {};
    statusCounts.forEach((s) => { statusMap[s._id] = s.count; });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    res.json({
      success: true,
      stats: {
        totalRevenue: totals[0]?.totalRevenue || 0,
        totalInvoices: totals[0]?.totalInvoices || 0,
        paidCount: statusMap.paid || 0,
        pendingCount: (statusMap.sent || 0) + (statusMap.draft || 0),
        draftCount: statusMap.draft || 0,
        cancelledCount: statusMap.cancelled || 0,
        monthlyRevenue: monthlyRevenue.map((m) => ({
          month: monthNames[m._id.month - 1],
          year: m._id.year,
          revenue: m.revenue,
          count: m.count,
        })),
        topCustomers: topCustomers.map((c) => ({
          name: c._id,
          totalAmount: c.totalAmount,
          invoiceCount: c.invoiceCount,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/invoices/:id
export const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.json({ success: true, invoice });
  } catch (error) {
    next(error);
  }
};

// GET /api/invoices/public/:token
export const getPublicInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ publicToken: req.params.token });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.json({ success: true, invoice });
  } catch (error) {
    next(error);
  }
};

// PUT /api/invoices/:id
export const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const profile = await BusinessProfile.findOne({ userId: req.user._id });
    const sellerState = profile?.state || invoice.seller?.state || '';
    const buyerState = req.body.buyer?.state || invoice.buyer?.state || '';

    // Recalculate if items changed
    if (req.body.items) {
      const totals = calculateBillTotals(req.body.items, sellerState, buyerState);
      req.body = {
        ...req.body,
        items: totals.items,
        isInterState: totals.isInterState,
        subtotal: totals.subtotal,
        totalDiscount: totals.totalDiscount,
        totalTaxable: totals.totalTaxable,
        totalCGST: totals.totalCGST,
        totalSGST: totals.totalSGST,
        totalIGST: totals.totalIGST,
        totalCess: totals.totalCess,
        totalTax: totals.totalTax,
        roundOff: totals.roundOff,
        grandTotal: totals.grandTotal,
        amountInWords: totals.amountInWords,
      };
    }

    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({ success: true, invoice: updated });
  } catch (error) {
    next(error);
  }
};

// PUT /api/invoices/:id/status
export const updateStatus = async (req, res, next) => {
  try {
    const { status, paymentDate, paymentMode } = req.body;
    const update = { status };
    if (status === 'paid') {
      update.paymentDate = paymentDate || new Date();
      update.paymentMode = paymentMode || '';
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: update },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, invoice });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/invoices/:id — soft delete
export const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { status: 'cancelled' } },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, message: 'Invoice cancelled' });
  } catch (error) {
    next(error);
  }
};

// POST /api/invoices/:id/duplicate
export const duplicateInvoice = async (req, res, next) => {
  try {
    const original = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });
    if (!original) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const profile = await BusinessProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(400).json({ success: false, message: 'Business profile not found' });
    }

    const currentFY = getCurrentFinancialYear();
    if (profile.currentFinancialYear !== currentFY) {
      profile.currentFinancialYear = currentFY;
      profile.lastInvoiceNumber = 0;
    }

    const { invoiceNumber, sequenceNumber } = generateInvoiceNumber(
      profile.invoicePrefix,
      profile.lastInvoiceNumber
    );

    const duplicated = await Invoice.create({
      ...original.toObject(),
      _id: undefined,
      invoiceNumber,
      invoiceDate: new Date(),
      dueDate: null,
      status: 'draft',
      publicToken: nanoid(12),
      paymentDate: null,
      paymentMode: '',
      createdAt: undefined,
      updatedAt: undefined,
    });

    profile.lastInvoiceNumber = sequenceNumber;
    await profile.save();

    await User.findByIdAndUpdate(req.user._id, { $inc: { invoiceCount: 1 } });

    res.status(201).json({ success: true, invoice: duplicated });
  } catch (error) {
    next(error);
  }
};

// POST /api/invoices/:id/send-whatsapp
export const sendWhatsApp = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const baseUrl = req.body.baseUrl || `${req.protocol}://${req.get('host')}`;
    const message = `*Invoice from ${invoice.seller.businessName}*
Invoice No: ${invoice.invoiceNumber}
Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
Amount: ₹${invoice.grandTotal.toLocaleString('en-IN')}
Status: ${invoice.status.toUpperCase()}

View & Download: ${baseUrl}/bill/${invoice.publicToken}

_Powered by SmartBill_`;

    const phone = req.body.phone || invoice.buyer.phone || '';
    const waUrl = phone
      ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    res.json({ success: true, whatsappUrl: waUrl, message });
  } catch (error) {
    next(error);
  }
};
