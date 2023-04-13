import { LitElement, html, css } from '@dreamworld/pwa-helpers/lit.js';
import '@dreamworld/dw-icon-button';
import forEach from 'lodash-es/forEach.js';

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
 * @event dw-image-opened { image }
 * @event dw-image-closed { image }
 * @event dw-image-fullscreen { image, enabled }
 *
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
          height: var(--dw-image-height, 100%);
          width: var(--dw-image-width, 100%);
          max-width: var(--dw-image-max-width);
          cursor: pointer;
          object-fit: var(--dw-image-object-fit, contain);
          box-sizing: border-box;
        }

        :host([border]) .image {
          border: var(--dw-image-border-width, 2px) solid var(--dw-image-border-color, #d8d8d8);
        }

        :host([auto='height']),
        :host([auto='height']) .image {
          height: var(--dw-image-height, auto) !important;
        }

        :host([auto='width']),
        :host([auto='width']) .image {
          width: var(--dw-image-width, auto) !important;
        }

        :host([disable-zoom]) .image {
          cursor: default;
        }

        .overlay {
          position: fixed;
          width: 100%;
          height: 100%;
          inset: 0px;
          background-color: var(--dw-overlay-background-color, rgba(0, 0, 0, 0.8));
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
        attribute: 'auto',
      },

      loading: {
        type: String,
        reflect: true
      },

      /**
       * Disabled zoom behaviour when this value is `true`.
       */
      disableZoom: {
        type: Boolean,
        reflect: true,
        attribute: 'disable-zoom',
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
      },

      /**
       * Toggles when clicks on full_screen icon.
       */
      _fullScreen: {
        type: Boolean,
      },
    };
  }

  constructor() {
    super();
    this.auto = 'height';
    this.__keydown = this.__keydown.bind(this);
    this.__onClick = this.__onClick.bind(this);
    this.__fullScreenChange = this.__fullScreenChange.bind(this);
    this.loading = "lazy"
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('_fullScreen') && this._isZoomMode) {
      if (this._fullScreen) {
        this._requestFullScreen();
        window.dispatchEvent(
          new CustomEvent('dw-image-fullscreen', {
            detail: { image: this.src, enabled: true },
          })
        );
      }
      if (!this._fullScreen) {
        this._exitFullScreen();
        window.dispatchEvent(
          new CustomEvent('dw-image-fullscreen', {
            detail: { image: this.src, enabled: false },
          })
        );
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.__onClick);
    document.addEventListener('keydown', this.__keydown);
    window.addEventListener('fullscreenchange', this.__fullScreenChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.__onClick);
    document.removeEventListener('keydown', this.__keydown);
    window.removeEventListener('fullscreenchange', this.__fullScreenChange);
  }

  __fullScreenChange() {
    if (document.fullscreenElement) {
      this._fullScreen = true;
      return;
    }
    this._fullScreen = false;
  }

  __onClick(e) {
    if (this._fullScreen) {
      return;
    }

    const paths = (e.composedPath && e.composedPath()) || e.path || [];
    let outsideImageClick = true;
    forEach(paths, function (el) {
      if (
        el.tagName === 'IMG' ||
        (el.tagName === 'DW-ICON-BUTTON' && el.id === 'close-btn') ||
        (el.tagName === 'DW-ICON-BUTTON' && el.id === 'full-screen') ||
        (el.tagName === 'DW-ICON-BUTTON' && el.id === 'exit-full-screen')
      ) {
        outsideImageClick = false;
        return;
      }
    });

    if (outsideImageClick) {
      this._isZoomMode = false;
      window.dispatchEvent(
        new CustomEvent('dw-image-closed', {
          detail: { image: this.src, ux: 'OVERLAY_CLICK' },
        })
      );
      return;
    }
  }

  __keydown(e) {
    let keycode = e.keycode;
    let key = e.key;
    if (keycode === 27 || key === 'Escape' || key === 'Esc') {
      if(!this._isZoomMode){
        return;
      }

      this._isZoomMode = false;
      window.dispatchEvent(
        new CustomEvent('dw-image-closed', {
          detail: { image: this.src, ux: 'ESC' },
        })
      );
      return;
    }
  }

  render() {
    return html`
      <img
        class="image"
        @click=${this._setZoomMode}
        title=${this.title || ''}
        src=${this.src}
        loading="${this.loading}"
        .disableZoom=${this.disableZoom}
      />
      ${this._zoomImageTemplate}
    `;
  }

  _setZoomMode() {
    if (this.disableZoom) {
      return;
    }

    this._isZoomMode = true;
    window.dispatchEvent(new CustomEvent('dw-image-opened', { detail: { image: this.src } }));
  }

  get _zoomImageTemplate() {
    if (!this._isZoomMode || this.disableZoom) {
      return;
    }

    return html` <div class="overlay">
      <div class="button-wrapper">
        ${
          this._fullScreen
            ? html` <dw-icon-button
                id="exit-full-screen"
                @click=${() => {
                  this._fullScreen = false;
                }}
                icon="fullscreen_exit"
                iconFont="OUTLINED"
              ></dw-icon-button>`
            : html` <dw-icon-button
                id="full-screen"
                @click=${() => {
                  this._fullScreen = true;
                }}
                icon="fullscreen"
                iconFont="OUTLINED"
              ></dw-icon-button>`
        }
     
        </dw-icon-button>
        <dw-icon-button
          id="close-btn"
          @click=${this._closeZoomImage}
          icon="close"
          iconFont="OUTLINED"
        >
        </dw-icon-button>
      </div>
      <div class="zoom-image-wrapper">
        <div class="zoom-image">
          <img loading="lazy" .title=${this.title} src=${this.zoomSrc || this.src} />
        </div>
      </div>
    </div>`;
  }

  _closeZoomImage() {
    if (this._fullScreen) {
      this._fullScreen = false;
    }

    setTimeout(() => {
      this._isZoomMode = false;
      window.dispatchEvent(
        new CustomEvent('dw-image-closed', {
          detail: { image: this.src, ux: 'CLOSE_BUTTON' },
        })
      );
    }, 100);
  }

  get _requstedFullScreenEl() {
    return this.renderRoot?.querySelector('.overlay');
  }

  _requestFullScreen() {
    if (this._fullScreen && !document.fullscreenElement) {
      if (this._requstedFullScreenEl.requestFullscreen) {
        this._requstedFullScreenEl.requestFullscreen();
      } else if (this._requstedFullScreenEl.webkitRequestFullscreen) {
        /* Safari */
        this._requstedFullScreenEl.webkitRequestFullscreen();
      } else if (this._requstedFullScreenEl.msRequestFullscreen) {
        /* IE11 */
        this._requstedFullScreenEl.msRequestFullscreen();
      }
    }
  }

  _exitFullScreen() {
    if (!this._fullScreen && document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        /* Safari */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        /* IE11 */
        document.mozCancelFullScreen();
      }
    }
  }
}

customElements.define('dw-image', DwImage);
