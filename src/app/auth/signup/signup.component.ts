import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  isLoading = false;

  constructor(private AuthService: AuthService) { }


  ngOnInit(): void {
  }


  onSignUp(form: NgForm){
    if(form.invalid){
      return;
    }
    this.isLoading = true;
    this.AuthService.createUser(form.value.email, form.value.password).subscribe(null, error => {
      this.isLoading = false;
    })
  }

}
