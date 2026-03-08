import Template from '../models/Template.model.js';

export const createTemplate = async (req, res, next) => {
  try {
    const template = await Template.create({
      ...req.body,
      userId: req.user._id,
    });
    res.status(201).json({ success: true, template });
  } catch (error) {
    next(error);
  }
};

export const getTemplates = async (req, res, next) => {
  try {
    const templates = await Template.find({
      $or: [{ userId: req.user._id }, { isPublic: true }],
    }).sort({ usageCount: -1 });

    res.json({ success: true, templates });
  } catch (error) {
    next(error);
  }
};

export const applyTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    template.usageCount += 1;
    await template.save();

    res.json({
      success: true,
      billType: template.billType,
      customFields: template.defaultCustomFields,
      defaultTerms: template.defaultTerms,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTemplate = async (req, res, next) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    next(error);
  }
};
