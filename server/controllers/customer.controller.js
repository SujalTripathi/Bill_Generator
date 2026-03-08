import Customer from '../models/Customer.model.js';
import Invoice from '../models/Invoice.model.js';

export const createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create({
      ...req.body,
      userId: req.user._id,
    });
    res.status(201).json({ success: true, customer });
  } catch (error) {
    next(error);
  }
};

export const getCustomers = async (req, res, next) => {
  try {
    const query = { userId: req.user._id };

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { gstin: searchRegex },
        { city: searchRegex },
      ];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json({ success: true, customers });
  } catch (error) {
    next(error);
  }
};

export const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const invoices = await Invoice.find({
      userId: req.user._id,
      'buyer.name': customer.name,
      status: { $ne: 'cancelled' },
    })
      .sort({ createdAt: -1 })
      .select('invoiceNumber invoiceDate grandTotal status billType');

    res.json({ success: true, customer, invoices });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, customer });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    next(error);
  }
};
