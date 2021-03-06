/*
 * Public API Surface of ngxi4-dynamic-service
 */

 // xuất bản dịch vụ ra
 export * from './lib/services/api-storage.service';
export * from './lib/services/auth.service';
export * from './lib/services/common.service';
export * from './lib/services/image.service';
export * from './lib/services/sqlite.service';

// xuất bản các components
export * from './lib/cards/card-dynamic-form/card-dynamic-form.component';
export * from './lib/cards/card-dynamic-list/card-dynamic-list.component';
export * from './lib/cards/card-multi-check/card-multi-check.component';

export * from './lib/popovers/multi-choice/multi-choice.component';
export * from './lib/popovers/popover-card/popover-card.component';

export * from './lib/popup-modals/camera-card/camera-card.component';
export * from './lib/popup-modals/dynamic-form-mobile/dynamic-form-mobile';
export * from './lib/popup-modals/dynamic-post-image/dynamic-post-image';
export * from './lib/popup-modals/ionic4-croppie/ionic4-croppie.component';

// xuất bản các pipes để sử dụng bên trong
export * from './lib/pipes/array-pipe';
export * from './lib/pipes/safe-pipe';
export * from './lib/pipes/new-line';


// xuất bản module
export * from './lib/ngxi4-dynamic-service.module';
