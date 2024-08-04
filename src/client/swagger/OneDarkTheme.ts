export const SwaggerOneDarkTheme = `@media (prefers-color-scheme: dark) {

    /* primary colors */

    .swagger-ui .topbar .download-url-wrapper .select-label select {
        border: 2px solid var(--swagger-color);
    }

    .swagger-ui .info .title small.version-stamp {
        background-color: var(--swagger-color);
    }

    .swagger-ui .info a {
        color: var(--link-color);
    }

    .swagger-ui .response-control-media-type--accept-controller select {
        border-color: var(--accept-header-color);
    }

    .swagger-ui .response-control-media-type__accept-message {
        color: var(--accept-header-color);
    }

    .swagger-ui .btn.authorize {
        color: var(--post-method-color);
    }

    .swagger-ui .btn.authorize {
        border-color: var(--post-method-color);
    }

    .swagger-ui .btn.authorize svg {
        fill: var(--post-method-color);
    }

    /* methods colors */
    /* http post */

    .swagger-ui .opblock.opblock-post .opblock-summary-method {
        background: var(--post-method-color);
    }

    .swagger-ui .opblock.opblock-post .opblock-summary {
        border-color: var(--post-method-color);
    }

    .swagger-ui .opblock.opblock-post {
        background: var(--post-method-background-color);
        border-color: var(--post-method-color);
    }

    .swagger-ui .opblock.opblock-post .tab-header .tab-item.active h4 span::after {
        background: var(--post-method-color);
    }

    /* http get */

    .swagger-ui .opblock.opblock-get .opblock-summary-method {
        background: var(--get-method-color);
    }

    .swagger-ui .opblock.opblock-get .opblock-summary {
        border-color: var(--get-method-color);
    }

    .swagger-ui .opblock.opblock-get {
        background: var(--get-method-background-color);
        border-color: var(--get-method-color);
    }

    .swagger-ui .opblock.opblock-get .tab-header .tab-item.active h4 span::after {
        background: var(--get-method-color);
    }

    /* http head */

    .swagger-ui .opblock.opblock-head .opblock-summary-method {
        background: var(--head-method-color);
    }

    .swagger-ui .opblock.opblock-head .opblock-summary {
        border-color: var(--head-method-color);
    }

    .swagger-ui .opblock.opblock-head {
        background: var(--head-method-background-color);
        border-color: var(--head-method-color);
    }

    .swagger-ui .opblock.opblock-head .tab-header .tab-item.active h4 span::after {
        background: var(--head-method-color);
    }

    /* http put */

    .swagger-ui .opblock.opblock-put .opblock-summary-method {
        background: var(--put-method-color);
    }

    .swagger-ui .opblock.opblock-put .opblock-summary {
        border-color: var(--put-method-color);
    }

    .swagger-ui .opblock.opblock-put {
        background: var(--put-method-background-color);
        border-color: var(--put-method-color);
    }

    .swagger-ui .opblock.opblock-put .tab-header .tab-item.active h4 span::after {
        background: var(--put-method-color);
    }

    /* http delete */

    .swagger-ui .opblock.opblock-delete .opblock-summary-method {
        background: var(--delete-method-color);
    }

    .swagger-ui .opblock.opblock-delete .opblock-summary {
        border-color: var(--delete-method-color);
    }

    .swagger-ui .opblock.opblock-delete {
        background: var(--delete-method-background-color);
        border-color: var(--delete-method-color);
    }

    .swagger-ui .opblock.opblock-delete .tab-header .tab-item.active h4 span::after {
        background: var(--delete-method-color);
    }

    /* http options */

    .swagger-ui .opblock.opblock-options .opblock-summary-method {
        background: var(--options-method-color);
    }

    .swagger-ui .opblock.opblock-options .opblock-summary {
        border-color: var(--options-method-color);
    }

    .swagger-ui .opblock.opblock-options {
        background: var(--options-method-background-color);
        border-color: var(--options-method-color);
    }

    .swagger-ui .opblock.opblock-options .tab-header .tab-item.active h4 span::after {
        background: var(--options-method-color);
    }

    /* http patch */

    .swagger-ui .opblock.opblock-patch .opblock-summary-method {
        background: var(--patch-method-color);
    }

    .swagger-ui .opblock.opblock-patchs .opblock-summary {
        border-color: var(--patch-method-color);
    }

    .swagger-ui .opblock.opblock-patch {
        background: var(--patch-method-background-color);
        border-color: var(--patch-method-color);
    }

    .swagger-ui .opblock.opblock-patch .tab-header .tab-item.active h4 span::after {
        background: var(--patch-method-color);
    }

    /* blocks */
    body {
        background-color: var(--all-bg-color);
        color: white;
    }

    .swagger-ui .topbar {
        background-color: var(--header-bg-color);
    }

    .swagger-ui .scheme-container {
        background: var(--secondary-bg-color);
    }

    .swagger-ui section.models .model-container {
        background: var(--secondary-bg-color);
        border-radius: var(--innner-block-border-radius);
    }

    .swagger-ui select {
        background: var(--selecter-bg-color);
        border-radius: var(--block-border-radius);
        color: var(--primary-text-color);
    }

    .swagger-ui section.models {
        border: 1px solid var(--block-border-color);
        background-color: var(--block-bg-color);
    }

    .swagger-ui .opblock .opblock-section-header {
        background: var(--secondary-bg-color);
    }

    .swagger-ui .body-param__example {
        background-color: var(--secondary-bg-color) !important;
        border-radius: var(--block-border-radius) !important;
    }

    .swagger-ui .example {
        background-color: var(--secondary-bg-color) !important;
        border-radius: var(--block-border-radius) !important;
    }

    .swagger-ui .copy-to-clipboard {
        background: rgba(255, 255, 255, var(--icons-opacity));
        border-radius: var(--block-border-radius);
    }

    .swagger-ui .opblock .opblock-summary-method {
        border-radius: var(--innner-block-border-radius);
    }

    .swagger-ui input[type="email"],
    .swagger-ui input[type="file"],
    .swagger-ui input[type="password"],
    .swagger-ui input[type="search"],
    .swagger-ui input[type="text"],
    .swagger-ui textarea {
        background: var(--secondary-bg-color);
        border: 1px solid var(--block-border-color);
        border-radius: var(--block-border-radius);
        color: var(--primary-text-color);
        outline: none;
    }

    .swagger-ui .dialog-ux .modal-ux-header {
        border-bottom: 1px solid var(--block-border-color);
    }

    .swagger-ui .btn {
        border: 2px solid var(--block-border-color);
        border-radius: var(--block-border-radius);
        color: var(--primary-text-color);
    }

    .swagger-ui .dialog-ux .modal-ux {
        background: var(--block-bg-color);
        border: 1px solid var(--block-border-color);
        border-radius: var(--block-border-radius);
    }

    .swagger-ui .auth-btn-wrapper {
        justify-content: left;
    }

    .swagger-ui .opblock-tag {
        border-bottom: 1px solid var(--block-border-color);
    }

    .swagger-ui section.models.is-open h4 {
        border-bottom: 1px solid var(--block-border-color);
    }

    .swagger-ui .opblock {
        border-radius: var(--block-border-radius);
    }

    .swagger-ui section.models {
        border-radius: var(--block-border-radius);
    }

    /* button white outline fix */

    .swagger-ui .model-box-control:focus,
    .swagger-ui .models-control:focus,
    .swagger-ui .opblock-summary-control:focus {
        outline: none;
    }

    /* icons */

    .swagger-ui .model-toggle::after {
        opacity: var(--icons-opacity);
        filter: var(--black-icons-filter);
    }

    .swagger-ui svg:not(:root) {
        fill: var(--primary-icon-color);
    }

    .swagger-ui .opblock-summary-control svg:not(:root) {
        opacity: var(--secondary-icon-opacity);
    }

    /* text */

    .swagger-ui {
        color: var(--primary-text-color);
    }

    .swagger-ui .info .title {
        color: var(--primary-text-color);
    }

    .swagger-ui a.nostyle {
        color: var(--primary-text-color);
    }

    .swagger-ui .model-title {
        color: var(--primary-text-color);
    }

    .swagger-ui .models-control {
        color: var(--primary-text-color);
    }

    .swagger-ui .dialog-ux .modal-ux-header h3 {
        color: var(--primary-text-color);
    }

    .swagger-ui .dialog-ux .modal-ux-content h4 {
        color: var(--primary-text-color);
    }

    .swagger-ui .dialog-ux .modal-ux-content p {
        color: var(--secondary-text-color);
    }

    .swagger-ui label {
        color: var(--primary-text-color);
    }

    .swagger-ui .opblock .opblock-section-header h4 {
        color: var(--primary-text-color);
    }

    .swagger-ui .tab li button.tablinks {
        color: var(--primary-text-color);
    }

    .swagger-ui .opblock-description-wrapper p,
    .swagger-ui .opblock-external-docs-wrapper p,
    .swagger-ui .opblock-title_normal p {
        color: var(--primary-text-color);
    }

    .swagger-ui table thead tr td, .swagger-ui table thead tr th {
        border-bottom: 1px solid var(--block-border-color);
        color: var(--primary-text-color);
    }

    .swagger-ui .response-col_status {
        color: var(--primary-text-color);
    }

    .swagger-ui .response-col_links {
        color: var(--secondary-text-color);
    }

    .swagger-ui .parameter__name {
        color: var(--primary-text-color);
    }

    .swagger-ui .parameter__type {
        color: var(--secondary-text-color);
    }

    .swagger-ui .prop-format {
        color: var(--secondary-text-color);
    }

    .swagger-ui .opblock-tag {
        color: var(--primary-text-color);
    }

    .swagger-ui .opblock .opblock-summary-operation-id,
    .swagger-ui .opblock .opblock-summary-path,
    .swagger-ui .opblock .opblock-summary-path__deprecated {
        color: var(--primary-text-color);
    }

    .swagger-ui .opblock .opblock-summary-description {
        color: var(--secondary-text-color);
    }

    .swagger-ui .info li,
    .swagger-ui .info p,
    .swagger-ui .info table {
        color: var(--secondary-text-color);
    }

    .swagger-ui .model {
        color: var(--secondary-text-color);
    }
}

:root {
    /* primary colors */
    --swagger-color: #62a03f;
    --link-color: #2e82e5;
    --accept-header-color: #47b750;

    /* methods colors */
    --post-method-color: rgb(141, 199, 111);
    --post-method-background-color: rgba(141, 199, 111, .08);
    --get-method-color: rgb(74, 176, 244);
    --get-method-background-color: rgba(74, 176, 244, .08);
    --head-method-color: rgb(217, 115, 234);
    --head-method-background-color: rgba(217, 115, 234, .08);
    --put-method-color: rgb(189, 135, 86);
    --put-method-background-color: rgba(189, 135, 86, .08);
    --delete-method-color: rgb(237, 99, 113);
    --delete-method-background-color: rgba(237, 99, 113, .08);
    --options-method-color: rgb(210, 175, 60);
    --options-method-background-color: rgba(210, 175, 60, .08);
    --patch-method-color: rgb(113, 128, 147);
    --patch-method-background-color: rgba(113, 128, 147, .08);

    /* background */
    --all-bg-color: #272C35;
    --secondary-bg-color: #272C35;
    --header-bg-color: #313845;
    --block-bg-color: #20252C;
    --selecter-bg-color: #313845;

    /* text */
    --primary-text-color: rgb(179, 187, 201);
    --secondary-text-color: rgba(177, 203, 255, 0.3);

    /* border */
    --block-border-color: rgba(220, 220, 255, 0.1);
    --block-border-radius: 6px;
    --innner-block-border-radius: 2px;

    /* icons */
    --primary-icon-color: rgb(179, 187, 201);
    --icons-opacity: .28;
    --secondary-icon-opacity: .5;
    --black-icons-filter: invert(1);
}`;
