import { LightningElement, api } from 'lwc';
import { nanoid } from 'c/nanoid';
import { POLARAREA_CHART_TYPE, RADAR_CHART_TYPE } from 'c/constants';
import getChartData from '@salesforce/apex/ChartBuilderController.getChartData';

export default class ChartBuilder extends LightningElement {
  containerClass = ChartBuilder.DEFAULT_CSS_CLASS;

  _flexipageRegionWidth;
  @api
  get flexipageRegionWidth() {
    return this._flexipageRegionWidth;
  }
  set flexipageRegionWidth(v) {
    this._flexipageRegionWidth = v;
    this.containerClass = `${ChartBuilder.DEFAULT_CSS_CLASS} ${this._flexipageRegionWidth}`;
  }

  @api
  recordId;

  @api
  title;

  @api
  type;

  @api
  styleCss;

  @api
  legendPosition;

  @api
  colorPalette = 'default';

  @api
  fill = false;

  _detailsLabels = [];
  @api
  get detailsLabels() {
    return this._detailsLabels;
  }
  set detailsLabels(v) {
    try {
      this._detailsLabels = JSON.parse(v);
    } catch (e) {
      this._detailsLabels = [];
    }
  }

  _details = [];
  @api
  get details() {
    if (!this._details) {
      return null;
    }
    let data;
    try {
      const palette = ChartBuilder.DEFAULT_PALETTE[this.colorPalette];
      data = this._details.map((x, i) => {
        const val = { ...x };
        val.uuid = val.uuid || nanoid(4);
        val.bgColor = val.bgColor || palette[i % palette.length];
        val.fill = this.fill;
        return val;
      });
      this.error = false;
    } catch (error) {
      this.errorCallback(error);
      data = null;
    }
    return data;
  }
  set details(v) {
    this._details = v ? (Array.isArray(v) ? v : JSON.parse(v)) : [];
  }

  _soql;
  @api
  get soql() {
    return this._soql;
  }
  set soql(v) {
    this._soql = v;
    if (this._soql) {
      this._soql = this._soql.replace(/:recordId/g, `'${this.recordId}'`);
      this._getChartDataHandler(
        ChartBuilder.SOQL_DATA_PROVIDER_APEX_TYPE,
        this._soql
      );
    }
  }

  _handler;
  @api
  get handler() {
    return this._handler;
  }
  set handler(v) {
    this._handler = v;
    if (this._handler) {
      this._getChartDataHandler(this._handler, this.recordId);
    }
  }

  get isRadial() {
    return [POLARAREA_CHART_TYPE, RADAR_CHART_TYPE].includes(this.type);
  }

  isLoaded = false;
  error = false;
  stack;

  renderedCallback() {
    this.isLoaded = true;
  }

  errorCallback(error, stack) {
    this.error = error;
    this.stack = stack;
  }

  handleError(evt) {
    this.errorCallback(evt.detail.error, evt.detail.stack);
  }

  _getChartDataHandler(handlerName, input) {
    getChartData({ chartDataProviderType: handlerName, ctx: input })
      .then(result => {
        this.details = result;
      })
      .catch(error => {
        this.errorCallback(error);
      });
  }

  // https://www.lightningdesignsystem.com/guidelines/charts/#Chart-Color
  /* 
  iterate over data and map a palette color modulo DEFAULT_PALETTE size with opacity and then decrement opacity
  */
  static DEFAULT_PALETTE = {
    //Default Palette: #52B7D8, #E16032, #FFB03B, #54A77B, #4FD2D2, #E287B2
    default: [
      'rgba(82,183,216,1)',
      'rgba(225,96,50,1)',
      'rgba(255,176,59,1)',
      'rgba(84,167,123,1)',
      'rgba(79,210,210,1)',
      'rgba(226,135,178,1)'
    ],
    //Color Safe: #529EE0, #D9A6C2, #08916D, #F59B00, #006699, #F0E442
    colorsafe: [
      'rgba(82,158,224,1)',
      'rgba(217,166,194,1)',
      'rgba(8,145,109,1)',
      'rgba(245,155,0,1)',
      'rgba(0,102,153,1)',
      'rgba(240,228,66,1)'
    ],
    //Light: #3296ED, #77B9F2, #9D53F2, #C398F5, #26ABA4, #4ED4CD
    light: [
      'rgba(50,150,237,1)',
      'rgba(119,185,242,1)',
      'rgba(157,83,242,1)',
      'rgba(195,152,245,1)',
      'rgba(38,171,164,1)',
      'rgba(78,212,205,1)'
    ],
    //Bluegrass: #C7F296, #94E7A8, #51D2BB, #27AAB0, #116985, #053661
    bluegrass: [
      'rgba(199,242,150,1)',
      'rgba(148,231,168,1)',
      'rgba(81,210,187,1)',
      'rgba(39,170,176,1)',
      'rgba(17,105,133,1)',
      'rgba(5,54,97,1)'
    ],
    //Sunrise: #F5DE98, #F5C062, #F59623, #CE6716, #762F3D, #300561
    sunrise: [
      'rgba(245,222,152,1)',
      'rgba(245,192,98,1)',
      'rgba(245,150,35,1)',
      'rgba(206,103,22,1)',
      'rgba(118,47,61,1',
      'rgba(48,5,97,1)'
    ],
    //Water: #96F2EE, #68CEEE, #2D9CED, #0E6ECE, #073E92, #051C61
    water: [
      'rgba(150,242,238,1)',
      'rgba(104,206,238,1)',
      'rgba(45,156,237,1)',
      'rgba(14,110,206,1)',
      'rgba(7,62,146,1)',
      'rgba(5,28,97,1)'
    ],
    //Watermelon: #F598A7, #F56580, #F4284E, #C11C2F, #5C3F22, #0A611B
    watermelon: [
      'rgba(245,152,167,1)',
      'rgba(245,101,128,1)',
      'rgba(244,40,78,1)',
      'rgba(193,28,47,1)',
      'rgba(92,63,34,1)',
      'rgba(10,97,27,1)'
    ]
  };

  static SOQL_DATA_PROVIDER_APEX_TYPE = 'SOQLDataProvider';
  static DEFAULT_CSS_CLASS = 'slds-card slds-p-around_small';
}