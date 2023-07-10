//types
import type { Project, Directory } from 'ts-morph';

import { formatCode } from '../utils';

type Location = Project|Directory;

export default function generate(project: Location) {
  const source = project.createSourceFile(`Validator.ts`, '', { overwrite: true });
  source.addClass({
    name: 'Validator',
    isDefaultExport: true,
    methods: [
      //general
      //public static eq(value: any, compare: any) { 
      //  return value == compare;
      //}
      {
        name: 'eq',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' },
          { name: 'compare', type: 'number' }
        ],
        statements: 'return value == compare;'
      },

      //public static isset(value: any) {
      //  return typeof value !== 'undefined' && value !== null;
      //}
      {
        name: 'isset',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: `return typeof value !== 'undefined' && value !== null;`
      },

      //public static ne(value: any, compare: any) { 
      //  return value != compare;
      //}
      {
        name: 'ne',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' },
          { name: 'compare', type: 'number' }
        ],
        statements: 'return value != compare;'
      },

      //public static notempty(value: any) { 
      //  if (Array.isArray(value)) {
      //    return value.length > 0;
      //  } else if (typeof value === 'object') {
      //    return Object.keys(value).length > 0;
      //  } else if (typeof value === 'number') {
      //    return value !== 0;
      //  }
      //  return this.safeValue(value).toString().length > 0;
      //}
      {
        name: 'notempty',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: formatCode(`
          if (Array.isArray(value)) {
            return value.length > 0;
          } else if (typeof value === 'object') {
            return Object.keys(value).length > 0;
          } else if (typeof value === 'number') {
            return value !== 0;
          }
          return this.safeValue(value).toString().length > 0;
        `).trim()
      },

      //public static option(value: any, options: any[]) { 
      //  return options.includes(value);
      //}
      {
        name: 'option',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' },
          { name: 'options', type: 'any[]' }
        ],
        statements: 'return options.includes(value);'
      },

      //public static regex(value: any, regex: string|RegExp) { 
      //  return new RegExp(regex).test(this.safeValue(value).toString());
      //}
      {
        name: 'regex',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' },
          { name: 'regex', type: 'string|RegExp' }
        ],
        statements: 'return new RegExp(regex).test(this.safeValue(value).toString());'
      },

      //public static required(value: any) { 
      //  return value !== null && typeof value !== 'undefined';
      //}
      {
        name: 'required',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: 'return value !== null && typeof value !== \'undefined\';'
      },
      
      //date
      //public static date(value: any) { 
      //  return this.regex(value, /^\\d{4}-\\d{2}-\\d{2}$/);
      //}
      {
        name: 'date',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: 'return this.regex(value, /^\\d{4}-\\d{2}-\\d{2}$/);'
      },
      
      //public static datetime(value: any) { 
      //  return this.regex(value, /^\\d{4}(\\-\\d{2}){2}(T|\\s){1}\\d{2}(:\\d{2}){1,2}(\\.\\d{3}){0,1}Z{0,1}$/);
      //}
      {
        name: 'datetime',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: 'return this.regex(value, /^\\d{4}(\\-\\d{2}){2}(T|\\s){1}\\d{2}(:\\d{2}){1,2}(\\.\\d{3}){0,1}Z{0,1}$/);'
      },
      
      //public static time(value: any) { 
      //  return this.regex(value, /^\\d{2}:\\d{2}(:\\d{2})*$/);
      //}
      {
        name: 'time',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: 'return this.regex(value, /^\\d{2}:\\d{2}(:\\d{2})*$/);'
      },
      
      //public static future(value: any) { 
      //  return new Date(value || 0) > new Date();
      //}
      {
        name: 'future',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: 'return new Date(value || 0) > new Date();'
      },
      
      //public static past(value: any) { 
      //  return new Date(value || 0) < new Date();
      //}
      {
        name: 'past',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: 'return new Date(value || 0) < new Date();'
      },
      
      //public static present(value: any) { 
      //  return new Date(value || 0).toDateString() === new Date().toDateString();
      //}
      {
        name: 'present',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: 'return new Date(value || 0).toDateString() === new Date().toDateString();'
      },
      
      //number
      //public static gt(value: any, compare: number) { 
      //  return (Number(value) || 0) > compare;
      //}
      {
        name: 'gt',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' },
          { name: 'compare', type: 'number' }
        ],
        statements: 'return (Number(value) || 0) > compare;'
      },
      
      //public static ge(value: any, compare: number) { 
      //  return (Number(value) || 0) >= compare;
      //}
      {
        name: 'ge',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' },
          { name: 'compare', type: 'number' }
        ],
        statements: 'return (Number(value) || 0) >= compare;'
      },
      
      //public static lt(value: any, compare: number) { 
      //  return (Number(value) || 0) < compare;
      //}
      {
        name: 'lt',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' },
          { name: 'compare', type: 'number' }
        ],
        statements: 'return (Number(value) || 0) < compare;'
      },
      
      //public static le(value: any, compare: number) { 
      //  return (Number(value) || 0) <= compare;
      //}
      {
        name: 'le',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' },
          { name: 'compare', type: 'number' }
        ],
        statements: 'return (Number(value) || 0) <= compare;'
      },
      
      //public static float(value: any) { 
      //  return this.regex(value, /^\\d+\\.\\d+$/);
      //}
      {
        name: 'float',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: 'return this.regex(value, /^\\d+\\.\\d+$/);'
      },
      
      //public static integer(value: any) { 
      //  return this.regex(value, /^\\d+$/);
      //}
      {
        name: 'integer',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: 'return this.regex(value, /^\\d+$/);'
      },
      
      //public static number(value: any) { 
      //  return this.regex(value, /^\\d+(\\.\\d+)*$/);
      //}
      {
        name: 'number',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: 'return this.regex(value, /^\\d+(\\.\\d+)*$/);'
      },
      
      //public static price(value: any) { 
      //  return this.regex(value, /^\\d+(\\.\\d{2})*$/);
      //}
      {
        name: 'price',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: 'return this.regex(value, /^\\d+(\\.\\d{2})*$/);'
      },
      
      //string
      //public static ceq(value: any, compare: number) { 
      //  return this.eq(this.safeValue(value).toString().length, compare);
      //}
      {
        name: 'ceq',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' },
          { name: 'compare', type: 'number' }
        ],
        statements: 'return this.eq(this.safeValue(value).toString().length, compare);'
      },
      
      //public static cgt(value: any, compare: number) { 
      //  return this.gt(this.safeValue(value).toString().length, compare);
      //}
      {
        name: 'cgt',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' },
          { name: 'compare', type: 'number' }
        ],
        statements: 'return this.gt(this.safeValue(value).toString().length, compare);'
      },
      
      //public static cge(value: any, compare: number) { 
      //  return this.ge(this.safeValue(value).toString().length, compare);
      //}
      {
        name: 'cge',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' },
          { name: 'compare', type: 'number' }
        ],
        statements: 'return this.ge(this.safeValue(value).toString().length, compare);'
      },
      
      //public static clt(value: any, compare: number) { 
      //  return this.lt(this.safeValue(value).toString().length, compare);
      //}
      {
        name: 'clt',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' },
          { name: 'compare', type: 'number' }
        ],
        statements: 'return this.lt(this.safeValue(value).toString().length, compare);'
      },
      
      //public static cle(value: any, compare: number) { 
      //  return this.le(this.safeValue(value).toString().length, compare);
      //}
      {
        name: 'cle',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' },
          { name: 'compare', type: 'number' }
        ],
        statements: 'return this.le(this.safeValue(value).toString().length, compare);'
      },
      
      //public static wgt(value: any, compare: number) { 
      //  return this.gt(this.safeValue(value).toString().split(' ').length, compare);
      //}
      {
        name: 'wgt',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' },
          { name: 'compare', type: 'number' }
        ],
        statements: 'return this.gt(this.safeValue(value).toString().split(\' \').length, compare);'
      },
      
      //public static wge(value: any, compare: number) { 
      //  return this.ge(this.safeValue(value).toString().split(' ').length, compare);
      //}
      {
        name: 'wge',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' },
          { name: 'compare', type: 'number' }
        ],
        statements: 'return this.ge(this.safeValue(value).toString().split(\' \').length, compare);'
      },
      
      //public static wlt(value: any, compare: number) { 
      //  return this.lt(this.safeValue(value).toString().split(' ').length, compare);
      //}
      {
        name: 'wlt',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' },
          { name: 'compare', type: 'number' }
        ],
        statements: 'return this.lt(this.safeValue(value).toString().split(\' \').length, compare);'
      },
      
      //public static wle(value: any, compare: number) { 
      //  return this.le(this.safeValue(value).toString().split(' ').length, compare);
      //}
      {
        name: 'wle',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' },
          { name: 'compare', type: 'number' }
        ],
        statements: 'return this.le(this.safeValue(value).toString().split(\' \').length, compare);'
      },
         
      //type
      //public static cc(value: any) { 
      //  return this.regex(value, /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/);
      //}
      {
        name: 'cc',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: 'return this.regex(value, /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\\d{3})\\d{11})$/);'
      },
      
      //public static email(value: any) { 
      //  return this.regex(value, /^(?:(?:(?:[^@,"\\[\\]\\x5c\\x00-\\x20\\x7f-\\xff\\.]|\\x5c(?=[@,"\\[\\]\\x5c\\x00-\\x20\\x7f-\\xff]))(?:[^@,"\\[\\]\\x5c\\x00-\\x20\\x7f-\\xff\\.]|(?<=\\x5c)[@,"\\[\\]\\x5c\\x00-\\x20\\x7f-\\xff]|\\x5c(?=[@,"\\[\\]\\x5c\\x00-\\x20\\x7f-\\xff])|\\.(?=[^\\.])){1,62}(?:[^@,"\\[\\]\\x5c\\x00-\\x20\\x7f-\\xff\\.]|(?<=\\x5c)[@,"\\[\\]\\x5c\\x00-\\x20\\x7f-\\xff])|[^@,"\\[\\]\\x5c\\x00-\\x20\\x7f-\\xff\\.]{1,2})|"(?:[^"]|(?<=\\x5c)"){1,62}")@(?:(?!.{64})(?:[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.?|[a-zA-Z0-9]\\.?)+\\.(?:xn--[a-zA-Z0-9]+|[a-zA-Z]{2,6})|\\[(?:[0-1]?\\d?\\d|2[0-4]\\d|25[0-5])(?:\\.(?:[0-1]?\\d?\\d|2[0-4]\\d|25[0-5])){3}\\])$/);
      //}
      {
        name: 'email',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: 'return this.regex(value, /^(?:(?:(?:[^@,"\\[\\]\\x5c\\x00-\\x20\\x7f-\\xff\\.]|\\x5c(?=[@,"\\[\\]\\x5c\\x00-\\x20\\x7f-\\xff]))(?:[^@,"\\[\\]\\x5c\\x00-\\x20\\x7f-\\xff\\.]|(?<=\\x5c)[@,"\\[\\]\\x5c\\x00-\\x20\\x7f-\\xff]|\\x5c(?=[@,"\\[\\]\\x5c\\x00-\\x20\\x7f-\\xff])|\\.(?=[^\\.])){1,62}(?:[^@,"\\[\\]\\x5c\\x00-\\x20\\x7f-\\xff\\.]|(?<=\\x5c)[@,"\\[\\]\\x5c\\x00-\\x20\\x7f-\\xff])|[^@,"\\[\\]\\x5c\\x00-\\x20\\x7f-\\xff\\.]{1,2})|"(?:[^"]|(?<=\\x5c)"){1,62}")@(?:(?!.{64})(?:[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.?|[a-zA-Z0-9]\\.?)+\\.(?:xn--[a-zA-Z0-9]+|[a-zA-Z]{2,6})|\\[(?:[0-1]?\\d?\\d|2[0-4]\\d|25[0-5])(?:\\.(?:[0-1]?\\d?\\d|2[0-4]\\d|25[0-5])){3}\\])$/);'
      },      
      
      //public static hex(value: any) { 
      //  return this.regex(value, /^[a-f0-9]+$/);
      //}
      {
        name: 'hex',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: 'return this.regex(value, /^[a-f0-9]+$/);'
      },
      
      //public static color(value: any) { 
      //  return this.regex(value, /^#?([a-f0-9]{6}|[a-f0-9]{3})$/);
      //}
      {
        name: 'color',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: 'return this.regex(value, /^#?([a-f0-9]{6}|[a-f0-9]{3})$/);'
      },
      
      //public static url(value: any) { 
      //  return this.regex(value,/^(http|https|ftp):\\/\\/([A-Z0-9][A-Z0-9_-]*(?:.[A-Z0-9][A-Z0-9_-]*)+):?(d+)?\\/?/i);
      //}
      {
        name: 'url',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: 'return this.regex(value,/^(http|https|ftp):\\/\\/([A-Z0-9][A-Z0-9_-]*(?:.[A-Z0-9][A-Z0-9_-]*)+):?(d+)?\\/?/i);'
      },
      
      //private static safeValue(value: any) {
      //  return this.required(value) ? value: '';
      //}
      {
        name: 'safeValue',
        isStatic: true,
        parameters: [
          { name: 'value', type: 'any' }
        ],
        statements: 'return this.required(value) ? value: \'\';'
      }
    ]
  });
};
