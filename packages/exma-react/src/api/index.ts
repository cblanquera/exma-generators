import dataFields from './fields.json';
import dataFormats from './formats.json';
import dataValidators from './validators.json';

export type OptionShowDefault<T> = { show: boolean, default: T };
export type OptionShowDefaultOptional<T> = { show: boolean, default?: T };
export type Validation = {
  method: ValidatorMethod,
  parameters: any[],
  message: string
};

export type FieldMethod = 'active' 
  | 'autocomplete' | 'checkbox'  | 'checklist' 
  | 'code'         | 'color'     | 'country' 
  | 'created'      | 'currency'  | 'date'
  | 'datetime'     | 'email'     | 'fieldset'
  | 'file'         | 'filelist'  | 'image'
  | 'imagelist'    | 'input'     | 'integer'
  | 'json'         | 'mask'      | 'metadata'
  | 'none'         | 'number'    | 'password'
  | 'phone'        | 'price'     | 'radio'        
  | 'radiolist'    | 'range'     | 'rating'
  | 'select'       | 'slider'    | 'slug'
  | 'small'        | 'switch'    | 'table'
  | 'taglist'      | 'text'      | 'textarea'
  | 'textlist'     | 'time'      | 'updated'
  | 'url'          | 'wysiwyg';

export type ValidatorMethod = 'eq'
  | 'ne'     | 'notempty' | 'option'
  | 'unique' | 'required' | 'regex'
  | 'date'   | 'datetime' | 'time'
  | 'future' | 'past'     | 'present'
  | 'gt'     | 'ge'       | 'lt'
  | 'le'     | 'float'    | 'integer'
  | 'number' | 'price'    | 'ceq'
  | 'cgt'    | 'cge'      | 'clt'
  | 'cle'    | 'wgt'      | 'wge'
  | 'wlt'    | 'wle'      | 'cc'
  | 'email'  | 'hex'      | 'color'
  | 'url';

export type FormatMethod = 'captal' 
  | 'char'     | 'color'    | 'comma'
  | 'country'  | 'currency' | 'date' 
  | 'carousel' | 'email'    | 'escaped'  
  | 'formula'  | 'hide'     | 'html'     
  | 'image'    | 'json'     | 'line'  
  | 'link'     | 'list'     | 'lower'
  | 'markdown' | 'metadata' | 'none'
  | 'number'   | 'ol'       | 'pretty' 
  | 'price'    | 'phone'    | 'rating'  
  | 'rel'      | 'relative' | 'space' 
  | 'table'    | 'taglist'  | 'text'  
  | 'ul'       | 'upper'    | 'word' 
  | 'yesno';

//column options
export type ColumnFieldOption = { 
  method: string,
  label: string,
  component: string|false, 
  attributes: OptionShowDefault<Record<string, any>> & {
    fixed: Record<string, any>
  }, 
  params: {
    field: string,
    attribute: string,
    attributes: Record<string, any>
  }[],
  default: OptionShowDefaultOptional<string|number>,
  validation: { show: boolean, filter: string[] },
  column: {
    type: string,
    name: OptionShowDefaultOptional<string>,
    label: OptionShowDefaultOptional<string>
  },
  data: {
    type: OptionShowDefaultOptional<string>,
    length: OptionShowDefaultOptional<number|[number, number]>,
    primary: OptionShowDefault<boolean>,
    required: OptionShowDefault<boolean>,
    unique: OptionShowDefault<boolean>,
    unsigned: OptionShowDefault<boolean>,
    relation: { show: boolean }
  },
  display: {
    list: OptionShowDefaultOptional<string> & { filter: string[] },
    view: OptionShowDefaultOptional<string> & { filter: string[] },
    searchable: OptionShowDefault<boolean>,
    filterable: OptionShowDefault<boolean>,
    sortable: OptionShowDefault<boolean>
  },
  enabled: boolean
};
export type ColumnValidationOption = { 
  method: string,
  label: string,
  params: {
    field: string,
    attributes?: Record<string, any>
  }[],
  enabled: boolean
};
export type ColumnFormatOption = { 
  method: string,
  label: string,
  component: string|false, 
  attributes: {
    show: boolean,
    fixed: Record<string, any>,
    default: Record<string, any>
  },  
  params: {
    field: string,
    attribute: string,
    attributes: Record<string, any>
  }[],
  enabled: boolean
};

export const data = {
  fields: dataFields as Record<string, Record<string, ColumnFieldOption>>,
  validators: dataValidators as Record<string, Record<string, ColumnValidationOption>>,
  formats: dataFormats as Record<string, Record<string, ColumnFormatOption>>
};

const get = <Options>(
  options: 'fields'|'validators'|'formats', 
  filter: string[] = [], 
  flat = false
) => {
  //if no filters include all fields
  if (!filter.length) {
    filter = Object
      .keys(data[options])
      .map(group => Object.keys(data[options][group]))
      .flat(1);
  }
  //filter fields
  const filtered: Record<string, Record<string, Options>> = {};
  for (const group in data[options]) {
    for (const option in data[options][group]) {
      if (filter.includes(option)) {
        if (!filtered[group]) {
          filtered[group] = {};
        }
        filtered[group][option] = data[options][group][option] as Options;
      }
    }
  }
  //if flat, de-group results
  if (flat) {
    const flat: Record<string, Options> = {};
    for (const group in filtered) {
      for (const option in filtered[group]) {
        flat[option] = filtered[group][option];
      }
    }
    return flat;
  }
  //otherwise return grouped results
  return filtered;
}

export const api = {
  field: {
    get: (name: string) => {
      return api.field.list([name])[name] as ColumnFieldOption|undefined;
    },
    list: (filter: string[] = []) => {
      return get<ColumnFieldOption>('fields', filter, true) as Record<string, ColumnFieldOption>;
    },
    groups: (filter: string[] = []) => {
      return get<ColumnFieldOption>('fields', filter, false) as Record<string, Record<string, ColumnFieldOption>>;
    }
  },
  validator: {
    get: (name: string) => {
      return api.validator.list([name])[name] as ColumnValidationOption|undefined;
    },
    list:(filter: string[] = []) => {
      return get<ColumnValidationOption>('validators', filter, true) as Record<string, ColumnValidationOption>;
    },
    groups:(filter: string[] = []) => {
      return get<ColumnValidationOption>('validators', filter, false) as Record<string, Record<string, ColumnValidationOption>>;
    },
  },
  format: {
    get: (name: string) => {
      return api.format.list([name])[name] as ColumnFormatOption|undefined;
    },
    list: (filter: string[] = []) => {
      return get<ColumnFormatOption>('formats', filter, true) as Record<string, ColumnFormatOption>;
    },
    groups: (filter: string[] = []) => {
      return get<ColumnFormatOption>('formats', filter, false) as Record<string, Record<string, ColumnFormatOption>>;
    },
  }
};
