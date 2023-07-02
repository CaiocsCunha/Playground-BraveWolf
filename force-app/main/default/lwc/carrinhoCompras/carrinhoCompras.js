import { api, LightningElement, track } from 'lwc';

export default class CarrinhoCompras extends LightningElement {
  
  @api itensPedidoList;

  @api
  cancelarPedido(){
    this.itensPedidoList = [];
  }

  get itensPedido(){
    return this.itensPedidoList;
  }

  retornar(){
    const eventRetornar = new CustomEvent('retornar',{});
    this.dispatchEvent(eventRetornar);
  }

  excluirItem(event){
    let pedidoAposExclusao = this.itensPedidoList.filter( item => item.idProduto != event.target.dataset.id);
    this.itensPedidoList = pedidoAposExclusao;
    const eventExcluirItem = new CustomEvent('excluiritem',{
      detail: event.target.dataset.id
    });
    this.dispatchEvent(eventExcluirItem);
  }
}