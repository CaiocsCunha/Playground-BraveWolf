import { api, LightningElement } from 'lwc';

export default class ListaProdutos extends LightningElement {
  @api produto;

  showResumo(){
    this.produto = Object.assign({}, this.produto);
    const event = new CustomEvent('showresumo',{
      detail: this.produto
    });
    this.dispatchEvent(event);
  }
}