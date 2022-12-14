import { AfterContentChecked, AfterViewInit, Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BigNumber, Contract, ethers, Signer } from 'ethers';
import { HomeComponent } from '../home/home.component';
import { HeaderComponent } from '../header/header.component';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { WalletService } from '../wallet.service';
import { abi } from '../../../../../backend/artifacts/contracts/IndexToken.sol/IndexToken.json';
import { ApiService } from '../api.service';
import { GetContractAddressesService } from '../get-contract-addresses.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterContentChecked {
  // streaming the header into this component
  @ViewChild('header', {read: ViewContainerRef, static: true}) vcr!: ViewContainerRef;
  
  ETH_USD_PRICE: string | number;
  WBTC_USD_PRICE: string | number;
  etherBalance: string;
  totalTokenSupply: string;
  indexValueUSD: string | number;
  dipTokenValue: string | number;
  displayDipTokenValue: string | number;
  dipBalance: string | number;
  walletConnected: boolean;
  walletAddress: string | undefined;
  allowance: string | undefined | number;
  usdDipBalance: string | number;
  displayTotalTokenSupply: string;
  displayDipBalance: string 
  wethOnContract: string | number;
  aWethOnContract: string | number;
  aWbtcOnContract: string | number;
  aWbtcOnContractInEth: string | number;
  displayAwethOnContract: string | number;
  displayAwbtcOnContract: string | number;
  walletShareDipPercent: string | number;
  walletShareAwbtc: string | number;
  walletShareAweth: string | number;
  walletShareWeth: string | number;
  

  ethWeight: string | number;
  btcWeight: string | number;


    
  constructor(private getContractAddressesService: GetContractAddressesService, private apiService: ApiService, private walletService: WalletService) { 
    this.ETH_USD_PRICE = "loading ...";
    this.WBTC_USD_PRICE = "loading ...";
    this.ETH_USD_PRICE = "loading ...";
    this.totalTokenSupply = 'loading ...';
    this.indexValueUSD = "loading ...";
    this.dipTokenValue = "loading ...";
    this.displayDipTokenValue = "loading ...";
    this.dipBalance = "loading ...";
    this.usdDipBalance = "loading ...";
    this.etherBalance = 'loading ...';
    this.walletConnected = false;
    this.displayTotalTokenSupply = "loading ...";
    this.displayDipBalance = "loading ...";

    this.wethOnContract = "loading ...";
    this.aWethOnContract = "loading ...";
    this.aWbtcOnContract = "loading ...";
    this.displayAwethOnContract = "loading ...";
    this.displayAwbtcOnContract = "loading ...";
    this.ethWeight = "loading ...";
    this.btcWeight = "loading ...";
    this.aWbtcOnContractInEth = "loading ...";
    this.walletShareDipPercent = "loading ...";
    this.walletShareAwbtc = "loading ...";
    this.walletShareAweth = "loading ...";
    this.walletShareWeth = "loading ...";
  }

  ngOnInit(): void {
    // streaming the header into this component
    const componentRef = this.vcr.createComponent(HeaderComponent);

    this.walletConnected = this.walletService.walletConnected;

    // subscribe to total token supply from api service
    this.apiService.getTotalTokenSupply().subscribe((response) => {
      this.totalTokenSupply = response;
      this.displayTotalTokenSupply = Number(this.totalTokenSupply).toFixed(2);
    });

    this.apiService.getIndexValue().subscribe((response) => {
      //const indexValueBN = response;
      this.indexValueUSD = ethers.utils.formatEther(response);
      console.log("total token supply: " + this.totalTokenSupply);
      if (Number(this.totalTokenSupply) != 0) {
        this.dipTokenValue = Number(this.indexValueUSD)/Number(this.totalTokenSupply);
        this.displayDipTokenValue = this.dipTokenValue.toFixed(2);
      } 
      else { 
        this.dipTokenValue = 0;
        this.displayDipTokenValue = "--";
        console.log("dip token value 0?: " + this.dipTokenValue);
      }
    });

    this.apiService.getWbtcUsdPrice().subscribe((response) => {
      this.WBTC_USD_PRICE = response.toFixed(2);
    });

    this.apiService.getEthUsdPrice().subscribe((response) => {
      this.ETH_USD_PRICE = response.toFixed(2);
    });



    // subscribe to dip balance from api service if wallet is connected
    if(this.walletConnected) {
      this.walletAddress = this.walletService.walletAddress;
      console.log(this.walletAddress);
      this.apiService.getDipBalance(this.walletAddress).subscribe((response) => {
        this.dipBalance = response;
        this.displayDipBalance = Number(this.dipBalance).toFixed(2);
        this.usdDipBalance = (Number(this.dipBalance) * Number(this.ETH_USD_PRICE)).toFixed(2);
    })
    } else {
      this.displayDipBalance = "--";
    }

    this.apiService.getWethOnContract().subscribe((response) => {
      this.wethOnContract = response;
      console.log("weth on contract ETH: " + this.wethOnContract);
    });

    this.apiService.getaWethOnContract().subscribe((response) => {
      this.aWethOnContract = response;
      this.displayAwethOnContract = Number(this.aWethOnContract).toFixed(4);
      console.log("aWeth on contract ETH: " + this.aWethOnContract);
    });

    this.apiService.getaWbtcOnContract().subscribe((response) => {
      this.aWbtcOnContract = response;
      this.displayAwbtcOnContract = Number(this.aWbtcOnContract).toFixed(4);
      console.log("aWbtc on contract: " + this.aWbtcOnContract);
    });

    this.apiService.getaWbtcOnContract().subscribe((response) => {
      this.aWbtcOnContract = response;
      this.displayAwbtcOnContract = Number(this.aWbtcOnContract).toFixed(4);
      console.log("aWbtc on contract: " + this.aWbtcOnContract);
    });


    if(this.walletConnected) {
      this.walletAddress = this.walletService.walletAddress;
      this.apiService.getDipBalance(this.walletAddress).subscribe(async (response) => {
        this.dipBalance = response;
        this.walletShareDipPercent = Number(this.dipBalance) / Number(this.totalTokenSupply);
        this.walletShareAwbtc = (Number(this.aWbtcOnContract) * Number(this.walletShareDipPercent)).toFixed(4);
        this.walletShareAweth = (Number(this.aWethOnContract) * Number(this.walletShareDipPercent)).toFixed(4);
        const aWbtcOnContractInEthBN = await this.getContractAddressesService.getAwbtsOnContractValue();
        this.aWbtcOnContractInEth = ethers.utils.formatEther(aWbtcOnContractInEthBN);
        console.log("aWbtc on contract in ETH: " + this.aWbtcOnContractInEth);
        this.ethWeight = ((Number(this.aWbtcOnContractInEth) / (Number(this.aWbtcOnContractInEth) + Number(this.aWethOnContract)))*100).toFixed(2);
        this.btcWeight = 100-Number(this.ethWeight);

        this.walletShareWeth = (Number(this.wethOnContract) * Number(this.walletShareDipPercent)).toFixed(4);
    })
    } else {
      this.walletShareAwbtc = "--";
      this.walletShareAweth = "--";
      this.ethWeight = "--";
      this.btcWeight = "--";
    }

    // console.log("This Display Dip Balance: " + this.displayDipBalance);
    // console.log("This Dip Balance: " + this.dipBalance);
    // console.log("This Total token supply: " + this.totalTokenSupply);
    // this.walletShareDipPercent = Number(this.dipBalance) / Number(this.totalTokenSupply);
    // console.log("DIP Share of wallet: " + this.walletShareDipPercent);
    // this.walletShareAwbtc = (Number(this.aWbtcOnContract) * Number(this.walletShareDipPercent)).toFixed(4);
    // this.walletShareAweth = (Number(this.aWethOnContract) * Number(this.walletShareDipPercent)).toFixed(4);
    // this.walletShareWeth = (Number(this.wethOnContract) * Number(this.walletShareDipPercent)).toFixed(4);


    // this.aWbtcOnContractInEth = ethers.utils.parseUnits(Number(this.aWbtcOnContract), 8);
    // console.log("aWbtcOnContractInEth: " + this.aWbtcOnContractInEth);
    // //if (Number(this.aWbtcOnContractInEth) != 0) {
    // this.ethWeight = Number(this.aWethOnContract) / (Number(this.aWbtcOnContractInEth) + Number(this.aWethOnContract));
    // console.log("Eth Weiht: " + this.ethWeight);
    // //}

    
  }

  async balance() {
    await this.getContractAddressesService.balance();
    const aWbtcOnContractValueBN = await this.getContractAddressesService.getAwbtsOnContractValue();
    const aWbtcOnContractValue = ethers.utils.formatEther(aWbtcOnContractValueBN);
    console.log("aWbtcOnContractValue: " + aWbtcOnContractValue);
  }
    

  ngAfterViewInit(): void {

  }

  ngAfterContentChecked(): void {
    
  }

  ngOnChanges(): void {
   
  }

  ngAfterViewChecked(): void {
    // this.walletAddress = this.walletService.walletAddress;
    // this.wallet = this.walletService.wallet;
    // this.etherBalance = this.walletService.etherBalance;
    // this.provider = this.walletService.provider;
    // this.signer = this.walletService.signer; 
    // this.dipBalance = this.walletService.dipBalance;
  }



}
