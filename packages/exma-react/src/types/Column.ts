import type { Data, ColumnConfig } from 'exma';
import type { 
  FieldMethod, 
  FormatMethod, 
  ValidatorMethod,
  ColumnValidationOption
} from '../api';

import Enum from './Enum';
import Type from './Type';
import { api } from '../api';

export type Validation = {
  method: ValidatorMethod,
  parameters: any[],
  message: string
};
export type ColumnField = {
  method: FieldMethod,
  attributes: Record<string, any>
};
export type ColumnValidation = Validation[];
export type ColumnFormat = {
  sticky?: boolean,
  method: FormatMethod,
  attributes: Record<string, any>
};

export const fields = api.field.list();
export const formats = api.format.list();
export const checkers = api.validator.list();

export const types: Record<string, string> = {
  String: 'string',
  Number: 'number',
  Int: 'integer',
  Integer: 'integer',
  Float: 'float',
  Boolean: 'boolean',
  Date: 'date',
  Datetime: 'datetime',
  Time: 'time',
  Json: 'json'
};

export const spanable = [ 
  'number', 'integer', 'float', 
  'date',   'time',    'datetime' 
];

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
    if (Array.isArray(this._config.attributes.default)) {
      return this._config.attributes.default[0];
    }
    return null;
  }

  /**
   * Returns the column field (defaults to none)
   */
  get field() {
    for (const name in fields) {
      if (!this._config.attributes[`field.${name}`]) {
        continue;
      }
      const flag = this._config.attributes[`field.${name}`];
      const field = typeof flag === 'object' ? flag : {};
      const config = fields[name];
      const method = name as FieldMethod;
      const attributes = {
        ...config.attributes.default,
        ...config.attributes.fixed,
        ...field
      };
      return { method, attributes, config };
    }

    return { 
      method: 'none' as FieldMethod, 
      attributes: {}, 
      config: fields.none 
    };
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
   * Returns the column list format (defaults to none)
   */
  get list() {
    for (const name in formats) {
      if (!this._config.attributes[`list.${name}`]) {
        continue;
      }
      const flag = this._config.attributes[`list.${name}`];
      const format = typeof flag === 'object' ? flag : {};
      const config = formats[name];
      const method = name as FormatMethod;
      const attributes = {
        ...config.attributes.default,
        ...config.attributes.fixed,
        ...format
      };

      return { method, attributes, config };
    }

    return { 
      method: 'none' as FormatMethod, 
      attributes: {}, config: 
      formats.none 
    };
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
   * Returns true if column is spanable
   */
  get spanable() {
    return this.filterable && spanable.includes(types[this._config.type]);
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
    const options = Enum.get(this._config.type);
    if (options) {
      return Object.values(options);
    }
    const type = Type.get(this._config.type);
    if (type) {
      return type;
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
   * Returns the column validators (defaults to none)
   */
  get validators() {
    const validators: {
      method: ValidatorMethod;
      parameters: Data[];
      message: string|null;
      config: ColumnValidationOption;
    }[] = [];
    for (const name in checkers) {
      if (!this._config.attributes[`is.${name}`]) {
        continue;
      }
      const flag = this._config.attributes[`is.${name}`];
      const config = checkers[name];
      const method = name as ValidatorMethod;
      const parameters = Array.isArray(flag) ? flag : [];
      const message = parameters.pop() as string || null;
      validators.push({ method, parameters, message, config });  
    }
    if (this._config.required && !validators.find(v => v.method === 'required')) {
      validators.push({ 
        method: 'required' as ValidatorMethod, 
        parameters: [], 
        message: `${this._config.name} is required`, 
        config: checkers.required 
      });
    }

    return validators;
  }

  /**
   * Returns the column view format (defaults to none)
   */
  get view() {
    for (const name in formats) {
      if (!this._config.attributes[`view.${name}`]) {
        continue;
      }
      const flag = this._config.attributes[`view.${name}`];
      const format = typeof flag === 'object' ? flag : {};
      const config = formats[name];
      const method = name as FormatMethod;
      const attributes = {
        ...config.attributes.default,
        ...config.attributes.fixed,
        ...format
      };

      return { method, attributes, config };
    }

    return { 
      method: 'none' as FormatMethod, 
      attributes: {}, config: 
      formats.none 
    };
  }

  /**
   * Sets the column config
   */
  constructor(config: ColumnConfig) {
    this._config = config;
  }
}