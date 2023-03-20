import { LitElement, html, css } from "@dreamworld/pwa-helpers/lit.js";
import { isElementAlreadyRegistered } from "@dreamworld/pwa-helpers/utils.js";
import "@dreamworld/dw-icon-button";

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
 *  - Auto none
 *     ```html
 *       <dw-image auto='none' src='https://picsum.photos/id/237/200/300' zoom-src='https://picsum.photos/id/237/1000/1000'></dw-image>
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
          --dw-icon-color: white;
        }

        .image {
          height: var(--kerika-image-height, 100%);
          width: var(--kerika-image-width, 100%);
          max-width: var(--kerika-image-max-width);
          cursor: pointer;
          object-fit: var(--dw-image-object-fit, contain);
          box-sizing: border-box;
        }

        :host([border]) .image {
          border: var(--dw-image-border-width, 2px) solid var(--dw-image-border-color, #d8d8d8);
        }

        :host([auto="height"]),
        :host([auto="height"]) .image {
          height: var(--kerika-image-height, auto) !important;
        }

        :host([auto="width"]),
        :host([auto="width"]) .image {
          width: var(--kerika-image-width, auto) !important;
        }

        :host([disable-zoom]) .image {
          cursor: default;
        }

        .overlay {
          position: fixed;
          width: 100%;
          height: 100%;
          inset: 0px;
          background-color:var(--dw-overlay-background-color, rgba(0, 0, 0, 0.8)) ;
          box-sizing: border-box;
          z-index: 1500;
        }

        .button-wrapper {
          position: absolute;
          display: flex;
          width: 100%;
          justify-content: flex-end;
        }

        .zoom-image-wrapper {
          display: flex;
          justify-content: center;
          width: 100%;
          height: calc(100% - 48px);
          box-sizing: border-box;
          margin-top: 48px;
        }

        .zoom-image {
          display: flex;
          justify-content: center;
          box-sizing: border-box;
          padding: 20px;
        }

        .zoom-image img {
          height: auto;
          width: 100%;
        }

        @media only screen and (max-width: 820px) {
          .zoom-image {
            align-items: center;
          }
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
        type: String,
      },

      /**
       * Image title.
       */
      title: {
        type: String,
      },

      /**
       * Auto compute css property name.
       * Default value: height
       * Possible value: height, width.
       */
      auto: {
        type: String,
        reflect: true,
        attribute: "auto",
      },

      /**
       * Disabled zoom behaviour when this value is `true`.
       */
      disableZoom: {
        type: Boolean,
        reflect: true,
        attribute: "disable-zoom",
      },

      /**
       * Zoomable image path.
       */
      zoomSrc: {
        type: String,
      },

      /**
       * Set `true` when user click on image and `disableZoom` is false.
       * If `true` then show zoomable image view.
       */
      _isZoomMode: {
        type: Boolean,
      }
    };
  }

  constructor() {
    super();
    this.auto= 'height';
    this.__keydown = this.__keydown.bind(this);
    this.__onlick = this.__onClick.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("click", this.__onClick);
    window.addEventListener("keydown", this.__keydown);
  }
  
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("click", this.__onClick);
    window.removeEventListener("keydown", this.__keydown);
  }
  
  __onClick(e) {
    const paths = e.composedPath && e.composedPath() || e.path || [];
    console.log("paths", paths);
    let outsideImageClick  = true;
    forEach(paths, function(el) {
      if(el.tagName === 'IMG') {
      outsideImageClick = false;
      return;
      }
    });
  
    if(outsideImageClick) {
      this._isZoomMode = false;
      return;
    }
  }
  
  __keydown(e) {
    let keycode = e.keycode;
    let key = e.key;
    if(keycode === 27 || key === 'Escape' || key === 'Esc') {
        this._isZoomMode = false;
        return;
    }
  }

  render() {
    return html`
        <img class="image"
          @click=${() => {
            if(this.disableZoom) {
              return;
            }
            this._isZoomMode = true;
          }}
          title=${this.title || ''}
          src=${this.src}
          .disableZoom=${this.disableZoom}
        />
      ${this._zoomImageTemplate}
    `;
  }

  get _zoomImageTemplate() {
    if (!this._isZoomMode || this.disableZoom ) {
      return;
    }

    return html` <div class="overlay">
      <div class="button-wrapper">
        <dw-icon-button
          @click=${() => {
            this._isZoomMode = false;
          }}
          icon="close"
          iconFont="OUTLINED"
        >
        </dw-icon-button>
      </div>
      <div class="zoom-image-wrapper">
        <div class="zoom-image">
          <img .title=${this.title} src=${this.zoomSrc || this.src} />
        </div>
      </div>
    </div>`;
  }

}

if (isElementAlreadyRegistered("dw-image")) {
  console.warn("lit: 'dw-image' is already registered, so registration skipped.");
} else {
  customElements.define("dw-image", DwImage);
}