import { Component, AfterViewInit, AfterViewChecked } from '@angular/core';
import { LoginService } from './Login.service';
import 'rxjs/add/operator/toPromise';
//import { Contract } from './models';
import { Router } from "@angular/router";
import { Address, Users, Employee, BusinessType, EmployeeType, Business, Item, ItemRequest, ItemType, Contract } from './models';
	
@Component({
  moduleId: module.id,
  selector: 'home',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./css/bootstrap.min.css',
  './css/style.css',
  './css/jqueryui1.css',
  './css/jqueryui2.css',
  './css/fontawesome.css'],
  providers: [LoginService]
})

export class DashboardComponent implements AfterViewInit, AfterViewChecked  {
	medicine: string;
    business: string;
	private allContracts;
	allItems;
	private errorMessage;
	contracts;
	pendingcontracts;
	items;
	newcontractitems;
	allbusinesses;
	actualname;
	type: string;
	isManufacturer: boolean;
	onItemsOwned: boolean;
	onContracts: boolean;
	
	constructor(private serviceLogin:LoginService,private router: Router){
	  //this.loadInfo(localStorage.getItem('id'));
	  //console.log("now here");
	  this.business = localStorage.getItem("name");
	  this.contracts = new Array();
	  this.actualname = localStorage.getItem("actualname");
	  this.pendingcontracts = new Array();
	  this.items = new Array();
	  this.newcontractitems = new Array();
	  this.type = localStorage.getItem('type');
	  if(this.type=="Manufacturer")
		  this.isManufacturer = true;
	  else
		  this.isManufacturer = false;
	  
	  this.onItemsOwned = true;
	  this.onContracts = false;
	  this.loadBusinesses();
	  this.loadContracts("resource:org.mat.Business#"+encodeURIComponent(localStorage.getItem("businessid")));
	  this.loadItems(this.business);
	  
    }
	
	ngAfterViewInit() {
	
		document.getElementById("topnav").style.display = "none";

		var height = window.innerHeight-80;
		var fullsize = document.getElementsByClassName("fullsize");
		
		for(var i = 0; i<fullsize.length; i++){
			(<HTMLElement>fullsize[i]).style.height = height+"px";
		}
	}
	
	ngAfterViewChecked(){
		this.resize();
	}
	
	updateContract(contract, bool){
		contract = JSON.parse(contract);
		//console.log(contract);
		
		if(bool){
			//console.log("add");
			contract.status="CONFIRMED";
			//console.log(contract);
			this.updateContractS(contract);
		} else {
			console.log("delete");
			contract.status="CANCELLED";
			this.updateContractS(contract);
		}
		//location.reload();
	}
	
	resize(){
		document.getElementById("topnav").style.display = "none";

		var height = window.innerHeight-80;
		var fullsize = document.getElementsByClassName("fullsize");
		
		for(var i = 0; i<fullsize.length; i++){
			(<HTMLElement>fullsize[i]).style.height = height+"px";
		}
	}
	
	logout(){
		localStorage.removeItem('email');
		localStorage.removeItem('id');
		localStorage.removeItem('name');
		localStorage.removeItem('type');
		document.getElementById("topnav").style.display = "block";
		this.router.navigate(['/']);
	}
	
	loadInfo(_id): Promise<any>  {
    	let usersList = [];
		return this.serviceLogin.getEmployee(_id)
		.toPromise()
		.then((result) => {
			this.errorMessage = null;
			result.forEach(user => {
				usersList.push(user);
			});     
		})
		.then(() => {	
			for (let user of usersList) {
				console.log("wow");
				console.log(user);
				localStorage.setItem('employeetype', user.employeeType);
				this.loadBusinessInfo(user.worksFor.split("#")[1]);
				break;
			}
		}).catch((error) => {
			if(error == 'Server error'){
				this.errorMessage = "Could not connect to REST server. Please check your configuration details";
			}
			else if (error == '500 - Internal Server Error') {
			  this.errorMessage = "Input error";
			}
			else{
				this.errorMessage = error;
			}
		});

	}

	loadBusinessInfo(_id): Promise<any>  {
    	let usersList = [];
		return this.serviceLogin.getBusiness(_id)
		.toPromise()
		.then((result) => {
			this.errorMessage = null;
			result.forEach(user => {
				usersList.push(user);
			});     
		})
		.then(() => {	
			for (let user of usersList) {
				console.log("wow2");
				console.log(user);
				localStorage.setItem('type', user.businessType);
				localStorage.setItem('businessName', user.name);
				localStorage.setItem('businessid', user.businessId);
				break;
			}
		}).catch((error) => {
			if(error == 'Server error'){
				this.errorMessage = "Could not connect to REST server. Please check your configuration details";
			}
			else if (error == '500 - Internal Server Error') {
			  this.errorMessage = "Input error";
			}
			else{
				this.errorMessage = error;
			}
		});

	}

	addNewMedicine(){
		var nmtamount = (<HTMLInputElement>document.getElementById("nmtamount")).value;
		//var nmpackage = (<HTMLInputElement>document.getElementById("nmpackage")).value;
		var nmtname = (<HTMLInputElement>document.getElementById("nmtname")).value;
		var nmtuom = (<HTMLInputElement>document.getElementById("nmtuom")).value;
		var nmtid = (<HTMLInputElement>document.getElementById("nmtid")).value;
		
		var itemtype: ItemType;
		itemtype = new ItemType();
		itemtype.itemTypeName = nmtname;
		
		
		var item: Item; 
		item = new Item();
		item.itemId = this.business+"-"+nmtid+"-"+nmtname;
		item.itemType = "org.mat.ItemType#"+nmtname;
		item.itemTypeUoM = nmtuom;
		item.amountOfMedication = parseInt(nmtamount);
		item.currentOwner = "org.mat.Business#"+localStorage.getItem("businessid");
		
		this.addItemType(itemtype);
		this.addItem(item);
		this.items.push(item);
		//console.log(item);
		
	}

	addNewContract(){
		var sellingbusiness = (<HTMLInputElement>document.getElementById("SellingBusiness")).value;
		var buyingbusiness = (<HTMLInputElement>document.getElementById("BuyingBusiness")).value;
		var itembuy = (<HTMLInputElement>document.getElementById("ItemBuy")).value;
		var unitprice = (<HTMLInputElement>document.getElementById("UnitPrice")).value;
		var quantity = (<HTMLInputElement>document.getElementById("Quantity")).value;
		
		var today = new Date();
		
		var itemRequest: ItemRequest;
		itemRequest = new ItemRequest();
		itemRequest.requestedItem = "org.mat.Item#"+JSON.parse(itembuy).itemId; 
		itemRequest.unitPrice = parseFloat(unitprice);
		itemRequest.quantity = parseInt(quantity);
		itemRequest.itemRequestId = "Tempaf"; //To-Do Fix (eventually will be removed)

		var contract: Contract;
		contract = new Contract();
		contract.contractId = JSON.parse(itembuy).itemType.split("#")[1]+"_"+today;
		contract.status = "WAITING_CONFIRMATION";
		contract.arrivalDateTime = today;
		contract.sellingBusiness = "org.mat.Business#"+JSON.parse(sellingbusiness).businessId;
		contract.buyingBusiness = "org.mat.Business#"+JSON.parse(buyingbusiness).businessId;

		//contract.ItemType = JSON.parse(itembuy);
		//contract.unitPrice = unitprice;
		//contract.quantity = quantity;

		//ItemRequest
		contract.requestedItems = [itemRequest];
		
		//console.log(contract);

		//eventually
		this.addContract(contract);
		this.contracts.push(contract);
	}
	
	loadItems(name): Promise<any>  {
    
    //retrieve all residents
		let itemsList = [];
		//return this.serviceLogin.getAllItems()
		return this.serviceLogin.getItem("resource:org.mat.Business#"+encodeURIComponent(localStorage.getItem("businessid")))
		.toPromise()
		.then((result) => {
				this.errorMessage = null;
				//console.log(result);
			  result.forEach(item => {
				item.str = JSON.stringify(item);
				itemsList.push(item);
				
			  });     
		})
		.then(() => {

		  for (let item of itemsList) {
			  //console.log(item);
			 
			//if(item.Business==name){ //probs gunna have to fix this when actually connecting
				this.items.push(item);
				
			//}
		  }
		  //console.log(this.items);
		  this.allItems = itemsList;
		  
		  //console.log(this.contracts);
		  //console.log("temp");
		  for(var i = 0; i<this.contracts.length; i++){
				var temp = this.contracts[i].requestedItems[0]; //TO-DO make this work for multiple medicines
				if(this.contracts[i].status=="WAITING_CONFIRMATION")
					continue;
				if(this.contracts[i].status=="CANCELLED")
					continue;

				//console.log("ads");
				//console.log(temp);
				//console.log(this.contracts[i].ItemType);
				//temp.itemTypeAmount = this.contracts[i].quantity;
				var foundmatch = null;
				for(var y = 0; y<this.items.length; y++){
					//console.log(this.items[y]);
					//console.log("resource:org.mat.Item#"+encodeURIComponent(this.items[y].itemId)+" "+temp.requestedItem);
					//console.log(temp);
					if("resource:org.mat.Item#"+encodeURIComponent(this.items[y].itemId)==temp.requestedItem){
						foundmatch = this.items[y];
						break;
					}
				}
				if(foundmatch==null){
					for(var y = 0; y<this.newcontractitems.length; y++){ //incase its not in the medicines (but we just added the medicine)
						//console.log(this.newcontractitems[y].id+" "+temp.id);
						if("resource:org.mat.Item#"+encodeURIComponent(this.newcontractitems[y].itemId)==temp.requestedItem){
							foundmatch = this.newcontractitems[y];
							break;
						}
					}
				}
				if(foundmatch!=null){
					//console.log(this.contracts[i].sellingBusiness);
					//console.log("resource:org.mat.Business#"+encodeURIComponent(localStorage.getItem("businessid")));
					var tempamountchange = this.contracts[i].sellingBusiness=="resource:org.mat.Business#"+encodeURIComponent(localStorage.getItem("businessid"))?-1:1;
					foundmatch.amountOfMedication = ""+(parseInt(foundmatch.amountOfMedication)+parseInt(temp.quantity)*tempamountchange);
					
					//console.log("1");
					//console.log(foundmatch);
				} else {
					//old method
					//this.newcontractitems.push(temp);
					this.getItem(this.contracts[i].sellingBusiness, temp);
				}
		  }
		  //console.log(this.items);
		}).catch((error) => {
			if(error == 'Server error'){
				this.errorMessage = "Could not connect to REST server. Please check your configuration details";
			}
			else if (error == '500 - Internal Server Error') {
			  this.errorMessage = "Input error";
			  setTimeout(this.loadItems(name), 1000);
			}
			else{
				this.errorMessage = error;
			}
		});

	  }

	  getItem(name, contractitem): Promise<any>  {
    
    //retrieve all residents
		let itemsList = [];
		//return this.serviceLogin.getAllItems()
		return this.serviceLogin.getItem(name)
		.toPromise()
		.then((result) => {
				this.errorMessage = null;
			  	//console.log("gee wilikers");
			  	//console.log(result);
			  result.forEach(item => {
				//item.str = JSON.stringify(item);
				itemsList.push(item);
				
			  });     
		})
		.then(() => {
			for (let item of itemsList) {
				//console.log("beep");
				//console.log(contractitem.requestedItem);
				//console.log("resource:org.mat.Item#"+encodeURIComponent(item.itemId));
				if(contractitem.requestedItem == "resource:org.mat.Item#"+encodeURIComponent(item.itemId)){
					item.amountOfMedication = contractitem.quantity;
					this.newcontractitems.push(item);
					break;
				}
			}
		}).catch((error) => {
			if(error == 'Server error'){
				this.errorMessage = "Could not connect to REST server. Please check your configuration details";
			}
			else if (error == '500 - Internal Server Error') {
			  this.errorMessage = "Input error";
			  setTimeout(this.getItem(name, contractitem), 1000);
			}
			else{
				this.errorMessage = error;
			}
		});

	  }
	  
	 loadBusinesses(): Promise<any>  {
    
    //retrieve all residents
		let itemsList = [];
		return this.serviceLogin.getAllBusinesses()
		.toPromise()
		.then((result) => {
				this.errorMessage = null;
			  result.forEach(item => {
				item.str = JSON.stringify(item);
				itemsList.push(item);
			  });     
		})
		.then(() => {
		  this.allbusinesses = itemsList;
		}).catch((error) => {
			if(error == 'Server error'){
				this.errorMessage = "Could not connect to REST server. Please check your configuration details";
			}
			else if (error == '500 - Internal Server Error') {
			  this.errorMessage = "Input error";
			  setTimeout(this.loadBusinesses(), 1000);
			}
			else{
				this.errorMessage = error;
			}
		});

	  }
	
	loadContracts(name): Promise<any>  {
    
    //retrieve all residents
		let contractsList = [];
		return this.serviceLogin.getAllContracts()
		.toPromise()
		.then((result) => {
				this.errorMessage = null;
			  result.forEach(item => {
				contractsList.push(item);
			  });     
			  //console.log(result);
		})
		.then(() => {

		  for (let contract of contractsList) {
		  	//console.log(contract.sellingBusiness+" vs "+name);
			if(contract.sellingBusiness==name||contract.buyingBusiness==name){
				if(contract.status=="CANCELLED"){

				} else if(contract.status=="WAITING_CONFIRMATION"&&contract.buyingBusiness==name){
					contract.str = JSON.stringify(contract);
					this.pendingcontracts.push(contract);
				} else {
					this.contracts.push(contract);
				}
			}
		  }
		  //console.log(this.contracts);
		  this.allContracts = contractsList;
		  //console.log(contractsList);
		}).catch((error) => {
			if(error == 'Server error'){
				this.errorMessage = "Could not connect to REST server. Please check your configuration details";
			}
			else if (error == '500 - Internal Server Error') {
			  this.errorMessage = "Input error";
			  setTimeout(this.loadContracts(name), 1000);
			}
			else{
				this.errorMessage = error;
			}
		});

	  }
	  
	addItem(item): Promise<any>  {
		return this.serviceLogin.addItem(item)
		.toPromise()
		.then(() => {
				this.errorMessage = null;
		})
		.then(() => {
		}).catch((error) => {
			if(error == 'Server error'){
				this.errorMessage = "Could not connect to REST server. Please check your configuration details";
			}
			else if (error == '500 - Internal Server Error') {
			  this.errorMessage = "Input error";
			  setTimeout(this.addItem(item), 1000);
			}
			else{
				this.errorMessage = error;
			}
		});
	}
	
	addItemType(item): Promise<any>  {
		return this.serviceLogin.addItemType(item)
		.toPromise()
		.then(() => {
				this.errorMessage = null;
		})
		.then(() => {
		}).catch((error) => {
			if(error == 'Server error'){
				this.errorMessage = "Could not connect to REST server. Please check your configuration details";
			}
			else if (error == '500 - Internal Server Error') {
			  this.errorMessage = "Input error";
			  setTimeout(this.addItemType(item), 1000);
			}
			else{
				this.errorMessage = error;
			}
		});
	}
	
	addContract(item): Promise<any>  {
		return this.serviceLogin.addContract(item)
		.toPromise()
		.then(() => {
				this.errorMessage = null;
		})
		.then(() => {
		}).catch((error) => {
			if(error == 'Server error'){
				this.errorMessage = "Could not connect to REST server. Please check your configuration details";
			}
			else if (error == '500 - Internal Server Error') {
			  this.errorMessage = "Input error";
			  setTimeout(this.addContract(item), 1000);
			}
			else{
				this.errorMessage = error;
			}
		});
	}
	
	updateContractS(item): Promise<any>  {
		return this.serviceLogin.updateContract(item.contractId, item)
		.toPromise()
		.then(() => {
				this.errorMessage = null;
				location.reload();
		})
		.then(() => {
		}).catch((error) => {
			if(error == 'Server error'){
				this.errorMessage = "Could not connect to REST server. Please check your configuration details";
			}
			else if (error == '500 - Internal Server Error') {
			  this.errorMessage = "Input error";
			  setTimeout(this.updateContractS(item), 1000);
			}
			else{
				this.errorMessage = error;
			}
		});
	}
	
	deleteContract(id): Promise<any>  {
		return this.serviceLogin.deleteContract(id)
		.toPromise()
		.then(() => {
				this.errorMessage = null;
		})
		.then(() => {
		}).catch((error) => {
			if(error == 'Server error'){
				this.errorMessage = "Could not connect to REST server. Please check your configuration details";
			}
			else if (error == '500 - Internal Server Error') {
			  this.errorMessage = "Input error";
			  setTimeout(this.deleteContract(id), 1000);
			}
			else{
				this.errorMessage = error;
			}
		});
	}
	
 }