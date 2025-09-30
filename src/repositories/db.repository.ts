import {
  Document,
  FilterQuery,
  FlattenMaps,
  HydratedDocument,
  Model,
  ProjectionFields,
  QueryOptions,
  UpdateQuery,
} from "mongoose";

export abstract class BaseRepository<T extends Document> {
  protected readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<HydratedDocument<T>> {
    const doc = await this.model.create(data);
    return doc;
  }

  async findOne(
    filter: FilterQuery<T>,
    projection?: ProjectionFields<T>,
    options?: QueryOptions
  ): Promise<FlattenMaps<HydratedDocument<T>> | HydratedDocument<T> | null> {
    const query = this.model.findOne(filter, projection, options);
    if (options?.lean) {
      query.lean();
    }
    const doc = await query.exec();
    return doc;
  }

  async findById(
    id: string,
    projection?: ProjectionFields<T>,
    options?: QueryOptions
  ): Promise<HydratedDocument<T> | null> {
    return this.model.findById(id, projection, options);
  }

  async findAll(
    filter: FilterQuery<T> = {},
    projection?: ProjectionFields<T>,
    options?: QueryOptions
  ): Promise<HydratedDocument<T>[]> {
    return this.model.find(filter, projection, options);
  }

  async update(
    id: string,
    updateData: UpdateQuery<T>,
    options?: QueryOptions
  ): Promise<HydratedDocument<T> | null> {
    return this.model.findByIdAndUpdate(id, updateData, {
      new: true,
      ...options,
    });
  }

  async delete(id: string): Promise<HydratedDocument<T> | null> {
    return this.model.findByIdAndDelete(id);
  }
}
