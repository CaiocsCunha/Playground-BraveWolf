public with sharing class CriarPedidosController {
    public class CriarPedidosException extends Exception {}   
    
    @AuraEnabled
    public static Pricebook2[] buscarTabelaPreco() {
        transient Pricebook2[] tabelasPreco = [SELECT Id,Name FROM Pricebook2];
        if(tabelasPreco.size() == 0){
            throw new CriarPedidosException('Nenhuma tabela de preços encontrada.');
        } else {
            return tabelasPreco;
        }
    }

    @AuraEnabled
    public static PricebookEntry[] buscarItensTabelaPreco(Id idTabela){
        transient PricebookEntry[] itensTabelaPreco = [SELECT Id,Name,UnitPrice,Product2Id FROM PricebookEntry WHERE Pricebook2Id = :idTabela];
        if(itensTabelaPreco.size() == 0){
            throw new CriarPedidosException('Nenhuma item da tabela de preços encontrado.');
        } else {
            return itensTabelaPreco;
        }
    }

    @AuraEnabled
    public static Account[] getAccounts(){
        transient Account[] accountList = [SELECT Id,Name FROM Account];
        if(accountList.size() == 0){
            throw new CriarPedidosException('Nenhuma conta encontrada.');
        } else {
            return accountList;
        }
    }

    @AuraEnabled
    public static void criarPedido(PedidoTO pedido){
        if(verificarPedidoEmAndamento(pedido.idConta)){
            try {
                Pedido__c novoPedido = new Pedido__c(
                Cliente__c = pedido.idConta,
                CatalogoPrecos__c = pedido.idTabela
                );
                insert novoPedido;
    
                List<ItemPedido__c> novosItensPedidoList = new List<ItemPedido__c>();
                for(ItemPedidoTO itemPedido : pedido.itens){
                    ItemPedido__c novoItemPedido = new ItemPedido__c(
                        Produto__c = itemPedido.idProduto,
                        Pedido__c = novoPedido.Id,
                        Preco__c = itemPedido.preco,
                        Quantidade__c = itemPedido.quantidade,
                        Name = itemPedido.nome
                    );
                    novosItensPedidoList.add(novoItemPedido);
                }
                insert novosItensPedidoList;
            } catch (Exception e) {
                throw new CriarPedidosException('Erro ao criar pedido! Error: '+ e.getMessage());
            }
        } else {
            throw new CriarPedidosException('Já existe um pedido em andamento.');
        }
        
    }

    private static Boolean verificarPedidoEmAndamento(Id idConta){
        Pedido__c[] buscarPedidosEmAndamento = [SELECT Status__c FROM Pedido__c WHERE Status__c != 'Finalizado' AND Cliente__c = :idConta];
        if(buscarPedidosEmAndamento.size() == 1){
            return false;
        } else {
            return true;
        }
    }

    class PedidoTO{
        @AuraEnabled public Id idTabela {get; set;}
        @AuraEnabled public Id idConta {get; set;}
        @AuraEnabled public List<ItemPedidoTO> itens {get; set;}
    }

    class ItemPedidoTO{
        @AuraEnabled public Id idProduto {get;set;}
        @AuraEnabled public String nome {get;set;}
        @AuraEnabled public Integer quantidade {get;set;}
        @AuraEnabled public Decimal preco {get;set;}
    }
}