
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Product } from '../product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductsServices {

  constructor(private http: HttpClient) { }

  private headers = new HttpHeaders({
    'authorId': 1065884
  });

  private _baseUrl = 'https://tribu-ti-staffing-desarrollo-afangwbmcrhucqfh.z01.azurefd.net/ipf-msa-productosfinancieros/bp/products'

  getProducts() {
    return this.http.get<Product[]>(this._baseUrl, { headers: this.headers });
  }

  createProduct(body: any) {
    console.log(body)
    return this.http.post(this._baseUrl, body, { headers: this.headers });
  }

  updateProduct(body: any) {
    console.log(body)
    return this.http.put(this._baseUrl, body, { headers: this.headers });
  }

  deleteProduct(id: string) {
    return this.http.delete(this._baseUrl + '?id=' + id, { responseType: 'text', headers: this.headers });
  }


}
