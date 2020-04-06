import Field, { FieldInterface } from '../models/field.schema';

export class FieldService {
  async create(field: Omit<FieldInterface, '_id' | 'facilities'>) {
    const newField = await Field.create(field);
    return newField ? newField : undefined;
  }

  async getAll() {
    const fields = await Field.find().populate('owner');
    return fields;
  }

  async get(id: FieldInterface['_id']) {
    const field = await Field.findOne({ _id: id });
    return field ? field : undefined;
  }

  async update(id: FieldInterface['_id'], changes: Partial<FieldInterface>) {
    const field = await Field.findByIdAndUpdate(id, changes, { new: true });
    return field ? field : undefined;
  }

  async remove(id: FieldInterface['_id']) {
    await Field.findByIdAndDelete(id);
  }
}
