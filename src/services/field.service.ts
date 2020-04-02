import Field, { FieldInterface } from '../models/field.schema';
import { UserInterface } from '../models/user.schema';

export class FieldService {
  async create(
    name: string,
    user: UserInterface,
    location: string,
    length: number,
    width: number,
    description: string,
  ) {
    const field = await Field.create(
      new Field({
        name,
        contacts: [user],
        location,
        length,
        width,
        description,
      }),
    );
    return field ? field : undefined;
  }

  async get(id: FieldInterface['_id']) {
    const field = await Field.findOne({ _id: id });
    return field ? field : undefined;
  }

  async getAll() {
    const fields = await Field.find();
    return fields;
  }

  async update(id: FieldInterface['_id'], changes: Partial<FieldInterface>) {
    return await Field.findByIdAndUpdate(id, changes);
  }

  async remove(id: FieldInterface['_id']) {
      return await Field.findByIdAndDelete(id);
  }
}
