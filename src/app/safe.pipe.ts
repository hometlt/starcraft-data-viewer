import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import * as DOMPurify from "dompurify";

@Pipe({
  name: 'safeHtml'
})
export class SafePipe implements PipeTransform {

  constructor(private sanitizer:DomSanitizer){}

  transform(html: string) {
    const sanitizedContent = DOMPurify.sanitize(html);
    return this.sanitizer.bypassSecurityTrustHtml(sanitizedContent);
    // return this.sanitizer.bypassSecurityTrustHtml(html);
    // return this.sanitizer.bypassSecurityTrustScript(html);
    // return this.sanitizer.bypassSecurityTrustUrl(html);
    // return this.sanitizer.bypassSecurityTrustResourceUrl(html);
  }
}
