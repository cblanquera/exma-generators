import { EOL } from 'os';
import { EnumConfig } from 'exma';
import { formatCode } from '../../utils';

export default class EnumTransformer {
  //the prisma generator config
  protected _name: string;
  //retainer for the schema instance
  protected _config: EnumConfig;
  
  static transform(name: string, config: EnumConfig) {
    return new EnumTransformer(name, config).transform();
  }

  constructor(_name: string, config: EnumConfig) {
    this._name = _name;
    this._config = config;
  }

  transform() {
    return formatCode(`enum ${this._name} {
      ${Object.keys(this._config).join(`${EOL}  `)}
    }`);
  }
};