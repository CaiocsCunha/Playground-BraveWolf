import { api, LightningElement, track } from 'lwc';

export default class CarrinhoCompras extends LightningElement {
  
  @api pedido;

  @api
  cancelarPedido(){
    this.pedido = [];
  }

  retornar(){
    const eventRetornar = new CustomEvent('retornar',{});
    this.dispatchEvent(eventRetornar);
  }

  excluirItem(event){
    const eventExcluirItem = new CustomEvent('excluiritem',{
      detail: event.target.dataset.id
    });
    this.dispatchEvent(eventExcluirItem);
  }
}