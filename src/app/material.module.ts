import { NgModule } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { MatIconModule, MatIconRegistry } from '@angular/material/icon';



/**
 * @export
 * @class MaterialModule
 */

@NgModule({
    exports: [
        
        MatIconModule,
        
    ],
    declarations: [],
    providers: [MatIconRegistry],
})
export class MaterialModule {
    constructor(
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer
    ) {
        this.matIconRegistry.addSvgIcon(
            'calendar',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                'assets/icons/calendar.svg'
            )
        );

    }
}