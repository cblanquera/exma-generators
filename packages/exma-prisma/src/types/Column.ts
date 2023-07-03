import type { ColumnConfig } from 'exma';

import Enum from './Enum';
import Type from './Type';

export const types: Record<string, string> = {
  'String': 'String',
  'Text': 'String',
  'Number': 'Float',
  'Integer': 'Int',
  'Int': 'Int',
  'Float': 'Float',
  'Boolean': 'Boolean',
  'Date': 'DateTime',
  'Time': 'DateTime',
  'Datetime': 'DateTime',
  'Json': 'Json',
  'Hash': 'Json'
};

export default class Column {
  protected _config: ColumnConfig;

  /**
   * Returns the column attributes
   */
  get attributes() {
    return this._config.attributes;
  }

  /**
   * Returns the column config
   */
  get config() {
    return this._config;
  }

  /**
   * Returns the column default value
   */
  get default() {
    //@default("some value")
    if (Array.isArray(this._config.attributes.default)
      && typeof this._config.attributes.default[0] === 'string'
    ) {
      const defaults = this._config.attributes.default[0];
      if (Enum.get(this._config.type) && typeof defaults === 'string') {
        return defaults;
      }
      if (defaults.length > 0) {
        if (/\(\)$/.test(defaults || '')) {
          return defaults;
        }
        if (this.typeliteral === 'DateTime') {
          return null;
        }
        return `"${defaults}"`;
      }
      return null;
    }
    return null;
  }

  /**
   * Returns true if column is filterable
   */
  get filterable() {
    return this._config.attributes.filterable === true;
  }

  /**
   * Returns true if column is a primary key
   */
  get id() {
    return this._config.attributes.id === true;
  }

  /**
   * Returns true if column is indexable (filterable, searchable, or sortable)
   */
  get indexable() {
    return this.filterable || this.searchable || this.sortable;
  }

  /**
   * Returns the column label
   */
  get label() {
    const label = this._config.attributes.label;
    return !Array.isArray(label) ? this._config.name : label[0] as string;
  }

  /**
   * Returns true if the column accepts multiple values
   */
  get multiple() {
    return this._config.multiple;
  }

  /**
   * Returns the column name
   */
  get name() {
    return this._config.name;
  }

  /**
   * Returns the column relation, if any
   */
  get relation() {
    const relation = this._config.attributes.relation as [string, string]|undefined;
    if (!relation 
      || typeof relation[0] !== 'string' 
      || typeof relation[1] !== 'string'
    ) {
      return null;
    }

    return { model: relation[0], column: relation[1] };
  }

  /**
   * Returns true if the column is required
   */
  get required() {
    return this._config.required;
  }

  /**
   * Returns true if column is searchable
   */
  get searchable() {
    return this._config.attributes.searchable === true;
  }

  /**
   * Returns true if column is sortable
   */
  get sortable() {
    return this._config.attributes.sortable === true;
  }

  /**
   * Returns true if column is stampable
   */
  get stampable() {
    return this._config.attributes.datestamp === true;
  }

  /**
   * Returns the column type
   */
  get type() {
    return this._config.type;
  }

  /**
   * Returns the column literaltype
   */
  get typeliteral() {
    if (types[this._config.type]) {
      return types[this._config.type];
    }
    if (Enum.get(this._config.type)) {
      return this._config.type;
    }
    if (Type.get(this._config.type)) {
      return 'Json';
    }
    return null;
  }

  /**
   * Returns true if column is unique
   */
  get unique() {
    return this._config.attributes.unique === true;
  }

  /**
   * Sets the column config
   */
  constructor(config: ColumnConfig) {
    this._config = config;
  }
}