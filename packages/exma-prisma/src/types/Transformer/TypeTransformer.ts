import { EOL } from 'os';
import { TypeConfig, ColumnConfig } from 'exma';
import Column from '../Column';
import { capitalize, formatCode } from '../../utils';

export default class TypeTransformer {
  //exma type config
  protected _config: TypeConfig;

  /**
   * Transforms exma type to prisma composite type
   */
  static transform(config: TypeConfig) {
    return new TypeTransformer(config).transform();
  }

  /**
   * Just sets the config
   */
  constructor(config: TypeConfig) {
    this._config = config;
  }

  /**
   * Transforms exma type to prisma composite type
   */
  transform() {
    return formatCode(`type ${capitalize(this._config.name)} {
      ${this._config.columns.map(this.column.bind(this)).join(`${EOL}  `)}
    }`);
  }

  /**
   * Transforms exma type column to prisma composite type column
   */
  column(config: ColumnConfig) {
    const column = new Column(config);
    const name = column.name;
    const multiple = column.multiple ? '[]' : '';
    const optional = column.required ? '' : '?';
    const type = `${column.typeliteral}${multiple}${optional}`;
    const attributes: string[] = [
      column.id ? '@id' : '',
      column.unique ? '@unique' : '',
      column.stampable ? '@updatedAt' : '',
      column.default ? `@default(${column.default})` : ''
    ].filter(attribute => attribute.length > 0);
    return `${name} ${type} ${attributes.join(' ')}`;
  }
};