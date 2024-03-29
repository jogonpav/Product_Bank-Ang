import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ReleaseDateValidator } from 'src/app/shared/validators/product.validators';
import { Product } from '../product.interface';
import { ProductsServices } from '../services/product-service/products-services.service';


@Component({
  selector: 'app-form-product',
  templateUrl: './form-product.component.html',
  styleUrls: ['./form-product.component.css']
})
export class FormProductComponent {

  @Input() productData!: Product;
  @Input() editMode: boolean = false;
  @Output() onSubmitEvent = new EventEmitter<Product>();
  public myForm: FormGroup;


  dateRevisionValue: any;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private productsSevice: ProductsServices
  ) {
    this.myForm = this.fb.group({
      id: ['',
        {
          validators: [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
          asyncValidators: [this.verifyProductId.bind(this)],
          updateOn: 'blur'
        }],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      date_release: ['', [Validators.required, ReleaseDateValidator]],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      logo: ['', [Validators.required]],
      date_revision: ['', [Validators.required]]       
    });
  }


  ngOnInit(): void {
    this.myForm.get('date_release')?.valueChanges.subscribe(date => {
      if (!this.myForm.controls['date_release'].errors) {
        this.handlerevisionDate(this.convertReleaseDate(date));
      }
    })

    this.editMode && this.setValueForm();

  }

  setValueForm() {
    this.myForm.patchValue({
      id: this.productData.id,
      name: this.productData.name,
      description: this.productData.description,
      logo: this.productData.logo,
      date_release: this.productData.date_release.substring(0, 10),
      date_revision: this.productData.date_revision.substring(0, 10),
    })
  }

  onSubmit() {
    this.dateRevisionValue && this.myForm.patchValue({
      date_revision: this.dateRevisionValue
    })
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return
    }
    this.onSubmitEvent.emit(this.myForm.value);
  }

  onReset() {
    if (this.editMode) {
      alert("No puedes usar Reset al editar un producto")
      return
    }
    this.myForm.reset();
    this.myForm.markAsUntouched();
  }

  convertReleaseDate(date: string) {
    let year = parseInt(date.substring(0, 4))
    let months = parseInt(date.substring(5, 7))
    let days = parseInt(date.substring(8, 10))
    let convertedReleaseDate = new Date(year, months, days);
    return convertedReleaseDate;
  }

  handlerevisionDate(ReleaseDate: Date) {
    ReleaseDate.setFullYear(ReleaseDate.getFullYear() + 1)
    const convertedRevisionDate = this.datePipe.transform(new Date(ReleaseDate), 'yyyy-MM-dd')
    this.dateRevisionValue = convertedRevisionDate;
    return convertedRevisionDate;
  }

  isNotValidFiel(field: string): boolean | null {
    return this.myForm.controls[field].errors && this.myForm.controls[field].touched
  }

  getFieldError(field: string): string | null {
    if (!this.myForm.controls[field]) return null;
    const errors = this.myForm.controls[field].errors || {};
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido!';
        case 'minlength':
          return `Mínimo ${errors['minlength'].requiredLength} caratacteres.`;
        case 'maxlength':
          return `Máximo ${errors['maxlength'].requiredLength} caratacteres.`;
        case 'releaseDateInvalid':
          return 'La fecha de liberación debe ser mayor o igual a la fecha actual';
        case 'productIdExist':
          return 'Id existente';
      }
    }
    return null
  }

  verifyProductId(control: AbstractControl): Promise<ValidationErrors | null> {
    const productId = control.value as string;
    if (!productId) {
      return Promise.resolve(null);
    }  
    return new Promise((resolve, reject) => {
      this.productsSevice.isProductExist(productId).subscribe(
        (exists) => {
          if (exists) {
            resolve({'productIdExist': true });
          } else {
            resolve(null);
          }
        });
    });
  }
 

}
