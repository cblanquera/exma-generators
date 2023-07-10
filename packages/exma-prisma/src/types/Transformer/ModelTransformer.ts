import { EOL } from 'os';
import { ModelConfig, ColumnConfig } from 'exma';
import Model from '../Model';
import Column from '../Column';
import { capitalize, formatCode } from '../../utils';

export default class ModelTransformer {
  //exma model config
  protected _config: ModelConfig;

  /**
   * Transforms exma model to prisma model
   */
  static transform(config: ModelConfig) {
    return new ModelTransformer(config).transform();
  }

  /**
   * Just sets the config
   */
  constructor(config: ModelConfig) {
    this._config = config;
  }

  /**
   * Transforms exma model to prisma model
   */
  transform() {
    return formatCode(`model ${capitalize(this._config.name)} {
      ${[
        ...this._config.columns.map(this.column.bind(this)),
        ...this.related(),
        ...this.relations()
      ].filter(column => column.length > 0).join(`${EOL}  `)}
    }`);
  }

  /**
   * Transforms exma model column to prisma model column
   */
  column(config: ColumnConfig) {
    const column = new Column(config);
    const name = column.name;
    const multiple = column.multiple && column.typeliteral !== 'Json' ? '[]' : '';
    const optional = column.required ? '' : '?';
    const type = `${column.typeliteral}${multiple}${optional}`;
    const attributes: string[] = [
      column.id ? '@id' : '',
      column.unique ? '@unique' : '',
      column.stampable ? '@updatedAt' : '',
      column.default !== null ? `@default(${column.default})` : ''
    ].filter(attribute => attribute.length > 0);
    return `${name} ${type} ${attributes.join(' ')}`;
  }

  /**
   * Adds related columns to prisma model
   */
  related() {
    const model = new Model(this._config);
    return Object.keys(model.related).map(name => {
      const column = model.related[name].column;
      const multiple = column.unique ? '' : '[]';
      const type = `${capitalize(name)}${multiple}`;
      return `${name.toLowerCase()} ${type}`;
    });
  }

  /**
   * Adds related columns to prisma model
   */
  relations() {
    const model = new Model(this._config);
    return model.relations.map(column => {
      const relation = column.relation as { model: string, column: string };
      const name = relation.model.toLowerCase();
      const optional = column.required ? '' : '?';
      const type = `${capitalize(relation.model)}${optional}`;
      const from  = column.name;
      const to = relation.column;
      // company Company? @relation(fields: [companyId], references: [id])
      return `${name} ${type} @relation(fields: [${from}], references: [${to}])`;
    });
  }
};