import { LitElement, html, css } from "@dreamworld/pwa-helpers/lit.js";
import { isElementAlreadyRegistered } from "@dreamworld/pwa-helpers/utils.js";

/**
 * A WebComponent to show zoomable image on documentation & blog sites.
 *
 * ## Behaviours
 * - Auto compute height or width based on `auto` property, give another value as a css of element.
 * - When user click on image, then image open in dialog using `zoomSrc` property. if `zoomSrc` is not available then use `src` property to show image in dialog.
 * - If you want to disable the above zoomable behaviour then `disableZoom` property passed as a `true`.
 *
 * ## Examples
 *  - Default example
 *     ```html
 *       <dw-image src='https://picsum.photos/id/237/200/300' zoom-src='https://picsum.photos/id/237/1000/1000'></dw-image>
 *     ```
 *
 *     ```css
 *       <!-- In this above case you give a height css property as an element. -->
 *       dw-image {
 *         width: 200px;
 *       }
 *     ```
 *  - Auto width
 *     ```html
 *       <dw-image auto='width' src='https://picsum.photos/id/237/200/300' zoom-src='https://picsum.photos/id/237/1000/1000'></dw-image>
 *     ```
 *
 *     ```css
 *       <!-- In this above case you give a height css property as an element. -->
 *       dw-image {
 *         height: 200px;
 *       }
 *     ```
 *  - Disabled zoomable behaviour and open link click on image.
 *    ```html
 *      <a href="https://www.google.com/">
 *        <dw-image src='https://picsum.photos/id/237/200/300' disable-zoom></dw-image>
 *      </a>
 *    ```
 * @element dw-image
 */
export class DwImage extends LitElement {
  static get styles() {
    return [
      css`
        :host {
          display: block;
        }
      `,
    ];
  }

  static get properties() {
    return {
      /**
       * Image path/source.
       */
      src: {
        type: String
      },

      /**
       * Image title.
       */
      title: {
        type: String
      },

      /**
       * Auto compute css property name.
       * Default value: height
       * Possible value: height, width.
       */
      auto: {
        type: String
      },

      /**
       * Disabled zoom behaviour when this value is `true`.
       */
      disableZoom: {
        type: Boolean
      },

      /**
       * Zoomable image path.
       */
      zoomSrc: {
        type: String
      }
    };
  }

  render() {
    return html`
    `;
  }
}

if (isElementAlreadyRegistered("dw-image")) {
  console.warn("lit: 'dw-image' is already registered, so registration skipped.");
} else {
  customElements.define("dw-image", DwImage);
}