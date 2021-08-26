import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from "@angular/forms";

export interface UserBasicInfo {
  fullName: string;
  email: string;
}

const BILLING_INFO = {
  address: {
    streetAddress: 'Sunset Blvd',
    areaCode: 123
  },
  userBasicInfo: {
    fullName: 'Michael Jordan',
    email: 'michael.jordan@gmail.com'
  }
};

@Component({
  selector: 'app-billing-info-unnested',
  templateUrl: './billing-info-unnested.component.html',
  styleUrls: ['./billing-info-unnested.component.css']
})
export class BillingInfoUnnestedComponent implements OnInit {

  billingIfo = BILLING_INFO;

  public nestedForm: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.nestedForm = this.formBuilder.group({
			basicInfo: {
        fname: this.billingIfo.userBasicInfo.fullName,
        email: this.billingIfo.userBasicInfo.email
      },
      address: {
        addressLine: this.billingIfo.address.streetAddress,
        areacode: this.billingIfo.address.areaCode
      }
    });
  }

  public onSubmit(){
    if(this.nestedForm.invalid){
      console.log("The form is invalid!")
      return;
    }

    console.log("Billing Form", this.nestedForm.value);
  }
}