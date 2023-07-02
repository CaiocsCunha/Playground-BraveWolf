import { LightningElement, track } from 'lwc';
import buscarTabelaPrecoCls from '@salesforce/apex/CriarPedidosController.buscarTabelaPreco';
import buscarItensTabelaPrecoCls from '@salesforce/apex/CriarPedidosController.buscarItensTabelaPreco';
import buscarContasCls from '@salesforce/apex/CriarPedidosController.getAccounts';
import criarPedidoCls from '@salesforce/apex/CriarPedidosController.criarPedido';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CriarPedidos extends LightningElement {
  @track isModalOpen = false;
  @track isShowCarrinho = false;
  @track isShowResumo = false;
  @track valueTabela = undefined;
  @track valueConta = undefined;
  @track tabelaPrecoOptions= [];
  @track produtosList = [];
  @track accountList = [];
  @track quantity = 0;
  @track produtoSelecionado;
  @track quantidadeItens;

  labels = {
    alertas: {
      erro: {
        erroAdicaoProduto: 'Erro ao adicionar produto.',
        erroQuantidade: 'Quantidade deve ser maior que ZERO!',
        faltaInfo: 'Falta informações no pedido, revise por favor!'

      },
      aviso: {
        semEdicao: 'Nenhuma edição detectada.',
        quantidadeMenor: 'Quantidade menor que a anterior não permitida!'
      },
      sucesso: {
        pedidoGerado: 'Pedido gerado com sucesso!',
        itemAdcionado: 'Item adicionado com sucesso',
        itemAtualizado: 'Item atualizado com sucesso!'
      }
    }
  }

  @track carrinhoComprasProps = {
    pedido : {
      idTabela: undefined,
      itens: [],
      idConta: undefined
    }
  }

  connectedCallback(){
    this.buscartabelaPreco();
    this.buscarContas();
  }

  renderedCallback(){
    if(this.quantidadeItens != undefined){
    //this.refs substitui o template.querySelector, podendo acessar de forma mais direta pelo lwc:ref
     this.refs.cartIcon.dataset.count = this.quantidadeItens;
    }
  }

  openModal() {
      this.isModalOpen = true;
  }

  closeModal() {
      this.isModalOpen = false;
      this.clearAll();
  }

  clearAll(){
    this.produtosList = [];
    this.carrinhoComprasProps.pedido.itens = [];
    this.carrinhoComprasProps.pedido.idConta = undefined;
    this.carrinhoComprasProps.pedido.idTabela = undefined;
    this.quantidadeItens = 0;
    this.produtoSelecionado = undefined;
    this.isShowCarrinho = false;
    this.isShowResumo = false;
    this.valueConta = undefined;
    this.valueTabela = undefined;
  }

  buscartabelaPreco() {
    buscarTabelaPrecoCls()
    .then(result => {
      result.forEach(element => {
        this.tabelaPrecoOptions.push({label: element.Name, value: element.Id});
      });
    })
    .catch(error =>{
      this.showToast('erro','error',error.body.message, 'dismissable');
    })
  }

  buscarContas() {
    buscarContasCls()
    .then(result => {
      result.forEach(element => {
        this.accountList.push({label: element.Name, value: element.Id});
      });
    })
    .catch(error =>{
      this.showToast('erro','error',error.body.message, 'dismissable');
    })
  }

  buscarItensTabela(idtabela) {
    buscarItensTabelaPrecoCls({idTabela : idtabela})
    .then(result => {
      this.produtosList = result;
    })
    .catch(error =>{
      this.showToast('erro','error',error.body.message, 'dismissable');
    })
  }

  adicionarProduto(){
    if(this.quantity > 0){
      let produto = this.carrinhoComprasProps.pedido.itens.filter(produto => produto.idProduto == this.produtoSelecionado.Product2Id);
      if(this.produtoSelecionado != undefined && produto.length == 0){
        let itemPedido = {
          idProduto: undefined,
          quantidade: undefined,
          nome: undefined,
          preco: undefined
        }
        itemPedido.idProduto = this.produtoSelecionado.Product2Id;
        itemPedido.quantidade = this.quantity;
        itemPedido.nome = this.produtoSelecionado.Name;
        itemPedido.preco = this.produtoSelecionado.UnitPrice;
        this.carrinhoComprasProps.pedido.itens.push(itemPedido);
        this.quantidadeItens = this.carrinhoComprasProps.pedido.itens.length;
        this.refs.cartIcon.dataset.count = this.quantidadeItens;
        this.showToast('success','Sucesso', this.labels.alertas.sucesso.itemAdcionado, 'dismissable');
      }else if(this.produtoSelecionado != undefined && produto.length != 0 && produto[0].quantidade != this.quantity && produto[0].quantidade < this.quantity){
        produto[0].quantidade = this.quantity;
        let listaFiltrada = this.carrinhoComprasProps.pedido.itens.filter(produto => produto.idProduto != this.produtoSelecionado.Product2Id);
        listaFiltrada.push(produto[0]);
        this.carrinhoComprasProps.pedido.itens = listaFiltrada;
        this.showToast('success','Sucesso',this.labels.alertas.sucesso.itemAtualizado, 'dismissable');
      } else if(this.produtoSelecionado != undefined && produto.length != 0 && produto[0].quantidade == this.quantity) {
        this.showToast('warning','Aviso',this.labels.alertas.aviso.semEdicao, 'dismissable');
      } else if(this.produtoSelecionado != undefined && produto.length != 0 && produto[0].quantidade > this.quantity){
        this.showToast('warning','Aviso',this.labels.alertas.aviso.quantidadeMenor, 'dismissable');
      } else {
        this.showToast('error','Erro',this.labels.alertas.erro.erroAdicaoProduto, 'dismissable');
      }
    } else {
      this.showToast('error','Erro',this.labels.alertas.erro.erroQuantidade, 'dismissable');
    }

  }

  criarPedido(){
    if(this.carrinhoComprasProps.pedido.idConta != undefined && this.carrinhoComprasProps.pedido.idTabela != undefined && this.carrinhoComprasProps.pedido.itens.length != 0){
      let pedidoToCreate = Object.assign({},this.carrinhoComprasProps.pedido)
      criarPedidoCls({pedido : pedidoToCreate})
      .then(result => {
        this.showToast('success','Sucesso',this.labels.alertas.sucesso.pedidoGerado, 'dismissable');
        this.clearAll();
      })
      .catch(error => {
        this.showToast('error','Erro',error.body.message, 'dismissable');
      })
    } else {
      this.showToast('error','Erro',this.labels.alertas.erro.faltaInfo, 'dismissable');
    }
  }

  excluirItem(event){
    let pedidoAposExclusao = this.carrinhoComprasProps.pedido.itens.filter( item => item.idProduto != event.detail);
    this.carrinhoComprasProps.pedido.itens = pedidoAposExclusao;
    this.quantidadeItens = this.carrinhoComprasProps.pedido.itens.length; 
  }

  returnToOrder(){
    this.isShowCarrinho = false;
    this.isModalOpen = true;
    if(this.carrinhoComprasProps.pedido.idConta != undefined){
      this.valueConta = this.carrinhoComprasProps.pedido.idConta;
    }
    if(this.carrinhoComprasProps.pedido.idTabela != undefined){
      this.valueTabela = this.carrinhoComprasProps.pedido.idTabela;
    }
  }

  openCarrinho(){
    this.isModalOpen = false;
    this.isShowCarrinho = true;
  }

  setAccount(event){
    this.carrinhoComprasProps.pedido.idConta = event.detail.value;
  }

  handleCatalogo(event) {
    this.produtosList = [];
    setTimeout(() => {
      
    }, 2000);
    this.buscarItensTabela(event.detail.value);
    this.carrinhoComprasProps.pedido.idTabela = event.detail.value;

  }

  showResumo(event){
    this.isShowResumo = true;
    this.produtoSelecionado = event.detail;
    let buscaItemNoCarrinho = this.carrinhoComprasProps.pedido.itens.filter(item => item.idProduto == this.produtoSelecionado.Product2Id);
    if(buscaItemNoCarrinho.length > 0){
      this.quantity = buscaItemNoCarrinho[0].quantidade;
    } else {
      this.quantity = 0;
    }
  }

  closeResumo(){
    this.isShowResumo = false;
  }

  increment(){
      this.quantity++;
  }
  decrement(){
      this.quantity > 0 && this.quantity--;
  }

  showToast(type, title, message, mode) {
    const event = new ShowToastEvent({
        variant: type,
        title: title,
        message: message,
        mode: mode
    });
    this.dispatchEvent(event);
}
}