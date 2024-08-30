/**
 * Image Helper Functions
 * -----------------------------------------------------------------------------
 * A collection of functions that help with basic image operations.
 *
 */

theme.Images = (function() {

  /**
   * Preloads an image in memory and uses the browsers cache to store it until needed.
   *
   * @param {Array} images - A list of image urls
   * @param {String} size - A shopify image size attribute
   */

  function preload(images, size) {
    if (typeof images === 'string') {
      images = [images];
    }

    for (var i = 0; i < images.length; i++) {
      var image = images[i];
      this.loadImage(this.getSizedImageUrl(image, size));
    }
  }

  /**
   * Loads and caches an image in the browsers cache.
   * @param {string} path - An image url
   */
  function loadImage(path) {
    new Image().src = path;
  }

  /**
   * Swaps the src of an image for another OR returns the imageURL to the callback function
   * @param image
   * @param element
   * @param callback
   */
  function switchImage(image, element, callback) {
    var size = this.imageSize(element.src);
    var imageUrl = this.getSizedImageUrl(image.src, size);

    if (callback) {
      callback(imageUrl, image, element); // eslint-disable-line callback-return
    } else {
      element.src = imageUrl;
    }
  }

  /**
   * +++ Useful
   * Find the Shopify image attribute size
   *
   * @param {string} src
   * @returns {null}
   */
  function imageSize(src) {
    var match = src.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\.@]/);

    if (match !== null) {
      return match[1];
    } else {
      return null;
    }
  }

  /**
   * +++ Useful
   * Adds a Shopify size attribute to a URL
   *
   * @param src
   * @param size
   * @returns {*}
   */
  function getSizedImageUrl(src, size) {
    if (size == null) {
      return src;
    }

    if (size === 'master') {
      return this.removeProtocol(src);
    }

    var match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);

    if (match != null) {
      var prefix = src.split(match[0]);
      var suffix = match[0];

      return this.removeProtocol(prefix[0] + '_' + size + suffix);
    }

    return null;
  }

  function removeProtocol(path) {
    return path.replace(/http(s)?:/, '');
  }

  return {
    preload: preload,
    loadImage: loadImage,
    switchImage: switchImage,
    imageSize: imageSize,
    getSizedImageUrl: getSizedImageUrl,
    removeProtocol: removeProtocol
  };
})();

/**
 * Currency Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help with currency formatting
 *
 * Current contents
 * - formatMoney - Takes an amount in cents and returns it as a formatted dollar value.
 *
 * Alternatives
 * - Accounting.js - http://openexchangerates.github.io/accounting.js/
 *
 */

theme.Currency = (function() {
  var moneyFormat = '${{amount}}'; // eslint-disable-line camelcase

  function formatMoney(cents, format) {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (format || moneyFormat);

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = precision || 2;
      thousands = thousands || ',';
      decimal = decimal || '.';

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var centsAmount = parts[1] ? (decimal + parts[1]) : '';

      return dollarsAmount + centsAmount;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(cents, 0, ' ');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  }

  return {
    formatMoney: formatMoney
  }
})();

window.theme = theme || {};

theme.customerTemplates = (function() {
  let selectors = {
    RecoverHeading: '#RecoverHeading',
    RecoverEmail: '#RecoverEmail',
    LoginHeading: '#LoginHeading'
  };

  function initEventListeners() {
    this.$RecoverHeading = $(selectors.RecoverHeading);
    this.$RecoverEmail = $(selectors.RecoverEmail);
    this.$LoginHeading = $(selectors.LoginHeading);

    // Show reset password form
    $('#RecoverPassword').on(
      'click',
      function(evt) {
        evt.preventDefault();
        showRecoverPasswordForm();
        this.$RecoverHeading.attr('tabindex', '-1').focus();
      }.bind(this)
    );

    // Hide reset password form
    $('#HideRecoverPasswordLink').on(
      'click',
      function(evt) {
        evt.preventDefault();
        hideRecoverPasswordForm();
        this.$LoginHeading.attr('tabindex', '-1').focus();
      }.bind(this)
    );

    this.$RecoverHeading.on('blur', function() {
      $(this).removeAttr('tabindex');
    });

    this.$LoginHeading.on('blur', function() {
      $(this).removeAttr('tabindex');
    });
  }

  /**
   *
   *  Show/Hide recover password form
   *
   */

  function showRecoverPasswordForm() {
    $('#RecoverPasswordForm').removeClass('hidden');
    $('#CustomerLoginForm').addClass('hidden');

    if (this.$RecoverEmail.attr('aria-invalid') === 'true') {
      this.$RecoverEmail.focus();
    }
  }

  function hideRecoverPasswordForm() {
    $('#RecoverPasswordForm').addClass('hidden');
    $('#CustomerLoginForm').removeClass('hidden');
  }

  /**
   *
   *  Show reset password success message
   *
   */
  function resetPasswordSuccess() {
    var $formState = $('.reset-password-success');

    // check if reset password form was successfully submited.
    if (!$formState.length) {
      return;
    }

    // show success message
    $('#ResetSuccess')
      .removeClass('hidden')
      .focus();
  }

  /**
   *
   *  Show/hide customer address forms
   *
   */
  function customerAddressForm() {
    var $newAddressForm = $('#AddressNewForm');
    var $newAddressFormButton = $('#AddressNewButton');

    if (!$newAddressForm.length) {
      return;
    }

    $('#address_form_new').submit(function(e){
      if ($('#AddressCountryNew').val() == '---') {
        $('#AddressCountryNew').focus();

        return false;
      } else {

        return true;
      }
    });

    // Initialize observers on address selectors, defined in shopify_common.js
    if (Shopify) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector(
        'AddressCountryNew',
        'AddressProvinceNew',
        {
          hideElement: 'AddressProvinceContainerNew'
        }
      );
    }

    // Initialize each edit form's country/province selector
    $('.address-country-option').each(function() {
      var formId = $(this).data('form-id');
      var countrySelector = 'AddressCountry_' + formId;
      var provinceSelector = 'AddressProvince_' + formId;
      var containerSelector = 'AddressProvinceContainer_' + formId;

      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
        hideElement: containerSelector
      });
    });

    // Toggle new/edit address forms
    $('.address-new-toggle').on('click', function() {
      var isExpanded = $newAddressFormButton.attr('aria-expanded') === 'true';

      $newAddressForm.toggleClass('hidden');
      $newAddressFormButton.attr('aria-expanded', !isExpanded).focus();
    });

    $('.address-edit-toggle').on('click', function() {
      var formId = $(this).data('form-id');
      var $editButton = $('#EditFormButton_' + formId);
      var $editAddress = $('#EditAddress_' + formId);
      var isExpanded = $editButton.attr('aria-expanded') === 'true';

      $editAddress.toggleClass('hidden');
      $editButton.attr('aria-expanded', !isExpanded).focus();
    });

    $('.address-delete').on('click', function() {
      var $el = $(this);
      var target = $el.data('target');
      var confirmMessage = $el.data('confirm-message');

      // eslint-disable-next-line no-alert
      if (
        confirm(
          confirmMessage || 'Are you sure you wish to delete this address?'
        )
      ) {
        Shopify.postLink(target, {
          parameters: { _method: 'delete' }
        });
      }
    });
  }

  /**
   *
   *  Check URL for reset password hash
   *
   */
  function checkUrlHash() {
    var hash = window.location.hash;

    // Allow deep linking to recover password form
    if (hash === '#recover') {
      showRecoverPasswordForm.bind(this)();
    }
  }

  return {
    init: function() {
      initEventListeners();
      checkUrlHash();
      resetPasswordSuccess();
      customerAddressForm();
    }
  };
})();

/*================ SECTIONS ================*/
window.theme = window.theme || {};

theme.Cart = (function() {
  var selectors = {
    cartCount: '[data-cart-count]',
    cartCountBubble: '[data-cart-count-bubble]',
    cartDiscount: '[data-cart-discount]',
    cartDiscountTitle: '[data-cart-discount-title]',
    cartDiscountAmount: '[data-cart-discount-amount]',
    cartDiscountWrapper: '[data-cart-discount-wrapper]',
    cartErrorMessage: '[data-cart-error-message]',
    cartErrorMessageWrapper: '[data-cart-error-message-wrapper]',
    cartItem: '[data-cart-item]',
    cartItemDetails: '[data-cart-item-details]',
    cartItemDiscount: '[data-cart-item-discount]',
    cartItemDiscountedPriceGroup: '[data-cart-item-discounted-price-group]',
    cartItemDiscountTitle: '[data-cart-item-discount-title]',
    cartItemDiscountAmount: '[data-cart-item-discount-amount]',
    cartItemDiscountList: '[data-cart-item-discount-list]',
    cartItemFinalPrice: '[data-cart-item-final-price]',
    cartItemImage: '[data-cart-item-image]',
    cartItemLinePrice: '[data-cart-item-line-price]',
    cartItemOriginalPrice: '[data-cart-item-original-price]',
    cartItemPrice: '[data-cart-item-price]',
    cartItemPriceList: '[data-cart-item-price-list]',
    cartItemProperty: '[data-cart-item-property]',
    cartItemPropertyName: '[data-cart-item-property-name]',
    cartItemPropertyValue: '[data-cart-item-property-value]',
    cartItemRegularPriceGroup: '[data-cart-item-regular-price-group]',
    cartItemRegularPrice: '[data-cart-item-regular-price]',
    cartItemTitle: '[data-cart-item-title]',
    cartItemVendor: '[data-cart-item-vendor]',
    cartItemOption: '[data-cart-item-option]',
    cartLineItems: '[data-cart-line-items]',
    cartNote: '[data-cart-notes]',
    cartQuantityErrorMessage: '[data-cart-quantity-error-message]',
    cartQuantityErrorMessageWrapper: '[data-cart-quantity-error-message-wrapper]',
    cartStockErrorMessage: '[data-cart-stock-error-message]',
    cartStockErrorMessageWrapper: '[data-cart-stock-error-message-wrapper]',
    cartRemove: '[data-cart-remove]',
    cartStatus: '[data-cart-status]',
    cartSubtotal: '[data-cart-subtotal]',
    cartTableCell: '[data-cart-table-cell]',
    cartWrapper: '[data-cart-wrapper]',
    emptyPageContent: '[data-empty-page-content]',
    quantityInput: '[data-quantity-input]',
    quantityInputMobile: '[data-quantity-input-mobile]',
    quantityInputDesktop: '[data-quantity-input-desktop]',
    quantityLabelMobile: '[data-quantity-label-mobile]',
    quantityLabelDesktop: '[data-quantity-label-desktop]',
    inputQty: '[data-quantity-input]',
    thumbnails: '.cart__image',
    unitPrice: '[data-unit-price]',
    unitPriceBaseUnit: '[data-unit-price-base-unit]',
    unitPriceGroup: '[data-unit-price-group]'
  };

  var classes = {
    cartNoCookies: 'cart--no-cookies',
    cartRemovedProduct: 'cart__removed-product',
    hide: 'hidden',
    inputError: 'input--error'
  };

  var attributes = {
    cartItemIndex: 'data-cart-item-index',
    cartItemKey: 'data-cart-item-key',
    cartItemQuantity: 'data-cart-item-quantity',
    cartItemTitle: 'data-cart-item-title',
    cartItemVendor: 'data-cart-item-vendor',
    cartItemUrl: 'data-cart-item-url',
    quantityItem: 'data-quantity-item'
  };

  var config = {
    showClass: 'cart__update--show',
    showEditClass: 'cart__edit--active',
    cartNoCookies: 'cart--no-cookies'
  };

  theme.breakpoints = theme.breakpoints || {};

  if (
    isNaN(theme.breakpoints.medium) ||
    theme.breakpoints.medium === undefined
  ) {
    theme.breakpoints.medium = 750;
  }

  var mediumUpQuery = '(min-width: ' + theme.breakpoints.medium + 'px)';

  function Cart(container) {
    this.$container = $(container);
    this.$edit = $(selectors.edit, this.$container);
    this.ajaxEnabled = this.$container.data('ajax-enabled');

    if (!this.cookiesEnabled()) {
      this.$container.addClass(config.cartNoCookies);
    }

    this.$container.on(
      'change',
      selectors.inputQty,
      $.debounce(500, this._handleInputQty.bind(this))
    );

    this.mql = window.matchMedia(mediumUpQuery);
    this.mql.addListener(this.setQuantityFormControllers.bind(this));
    this.setQuantityFormControllers();

    if (this.ajaxEnabled) {
      /**
       * Because the entire cart is recreated when a cart item is updated,
       * we cannot cache the elements in the cart. Instead, we add the event
       * listeners on the cart's container to allow us to retain the event
       * listeners after rebuilding the cart when an item is updated.
       */

      this.$container.on(
        'change',
        selectors.cartNote,
        this._onNoteChange.bind(this)
      );

      this.$container.on(
        'click',
        selectors.cartRemove,
        this._onRemoveItem.bind(this)
      );

      this._setupCartTemplates();
    }
  }

  Cart.prototype = _.assignIn({}, Cart.prototype, {
    _setupCartTemplates: function() {
      this.$itemTemplate = $(selectors.cartItem, this.$container)
        .first()
        .clone();
      this.$itemDiscountTemplate = $(
        selectors.cartItemDiscount,
        this.$itemTemplate
      ).clone();
      this.$itemOptionTemplate = $(
        selectors.cartItemOption,
        this.$itemTemplate
      ).clone();
      this.$itemPropertyTemplate = $(
        selectors.cartItemProperty,
        this.$itemTemplate
      ).clone();
      this.$itemPriceListTemplate = $(
        selectors.cartItemPriceList,
        this.$itemTemplate
      ).clone();
      this.$itemLinePriceTemplate = $(
        selectors.cartItemLinePrice,
        this.$itemTemplate
      ).clone();
      this.$cartDiscountTemplate = $(
        selectors.cartDiscount,
        this.$container
      ).clone();
    },

    _handleInputQty: function(evt) {
      var $input = $(evt.target);
      var itemIndex = $input.data('quantity-item');
      var $itemElement = $input.closest(selectors.cartItem);
      var $itemQtyInputs = $('[data-quantity-item=' + itemIndex + ']');
      var value = parseInt($input.val());
      var isValidValue = !(value < 0 || value > 99 || isNaN(value));
      $itemQtyInputs.val(value);

      this._hideCartError();
      this._hideQuantityErrorMessage();

      if (!isValidValue) {
        this._showQuantityErrorMessages($itemElement);
        return;
      }

      if (isValidValue && this.ajaxEnabled) {
        this._updateItemQuantity(
          itemIndex,
          $itemElement,
          $itemQtyInputs,
          value
        );
      }
    },

    _updateItemQuantity: function(
      itemIndex,
      $itemElement,
      $itemQtyInputs,
      value
    ) {
      var key = $itemElement.attr(attributes.cartItemKey);
      var index = $itemElement.attr(attributes.cartItemIndex);

      var params = {
        url: '/cart/change.js',
        data: { quantity: value, line: index },
        dataType: 'json'
      };

      $.post(params)
        .done(
          function(state) {
            if (state.item_count === 0) {
              this._emptyCart();
            } else {
              this._createCart(state);

              if (value === 0) {
                this._showRemoveMessage($itemElement.clone());
              } else {
                var item = this.getItem(key, state);

                if(item.quantity == value) {
                  var $lineItem = $('[data-cart-item-key="' + key + '"]');

                  $(selectors.quantityInput, $lineItem).focus();
                  this._updateLiveRegion(item);
                } else if(item.quantity < value) {
                  this._showStockErrorMessages($itemElement);
                }
              }

              this._setShippingInfo(state);
            }

            this._setCartCountBubble(state.item_count);
          }.bind(this)
        )
        .fail(
          function() {
            this._showCartError($itemQtyInputs);
          }.bind(this)
        );
    },

    getItem: function(key, state) {
      return state.items.find(function(item) {
        return item.key === key;
      });
    },

    _liveRegionText: function(item) {
      // Dummy content for live region
      var liveRegionText =
        theme.strings.update +
        ': [QuantityLabel]: [Quantity], [Regular] [$$] [DiscountedPrice] [$]. [PriceInformation]';

      // Update Quantity
      liveRegionText = liveRegionText
        .replace('[QuantityLabel]', theme.strings.quantity)
        .replace('[Quantity]', item.quantity);

      // Update pricing information
      var regularLabel = '';
      var regularPrice = theme.Currency.formatMoney(
        item.original_line_price,
        theme.moneyFormat
      );
      var discountLabel = '';
      var discountPrice = '';
      var discountInformation = '';

      if (item.original_line_price > item.final_line_price) {
        regularLabel = theme.strings.regularTotal;

        discountLabel = theme.strings.discountedTotal;
        discountPrice = theme.Currency.formatMoney(
          item.final_line_price,
          theme.moneyFormat
        );

        discountInformation = theme.strings.priceColumn;
      }

      liveRegionText = liveRegionText
        .replace('[Regular]', regularLabel)
        .replace('[$$]', regularPrice)
        .replace('[DiscountedPrice]', discountLabel)
        .replace('[$]', discountPrice)
        .replace('[PriceInformation]', discountInformation)
        .trim();

      return liveRegionText;
    },

    _updateLiveRegion: function(item) {
      var $liveRegion = $(selectors.cartStatus);
      $liveRegion.html(this._liveRegionText(item)).attr('aria-hidden', false);

      // hide content from accessibility tree after announcement
      setTimeout(function() {
        $liveRegion.attr('aria-hidden', true);
      }, 1000);
    },

    _createCart: function(state) {
      var cartDiscountList = this._createCartDiscountList(state);

      $(selectors.cartLineItems, this.$container).html(
        this._createLineItemList(state)
      );

      this.setQuantityFormControllers();

      $(selectors.cartNote, this.$container).val(state.note);

      if (cartDiscountList.length === 0) {
        $(selectors.cartDiscountWrapper, this.$container)
          .html('')
          .addClass(classes.hide);
      } else {
        $(selectors.cartDiscountWrapper, this.$container)
          .html(cartDiscountList)
          .removeClass(classes.hide);
      }

      $(selectors.cartSubtotal, this.$container).html(
        theme.Currency.formatMoney(
          state.total_price
        )
      );
    },

    _createCartDiscountList: function(cart) {
      return $.map(
        cart.cart_level_discount_applications,
        function(discount) {
          var $discount = this.$cartDiscountTemplate.clone();
          $discount.find(selectors.cartDiscountTitle).text(discount.title);
          $discount
            .find(selectors.cartDiscountAmount)
            .html(
              theme.Currency.formatMoney(
                discount.total_allocated_amount,
                theme.moneyFormat
              )
            );
          return $discount[0];
        }.bind(this)
      );
    },

    _createLineItemList: function(state) {
      return $.map(
        state.items,
        function(item, index) {
          let $item = this.$itemTemplate.clone();
          let $itemPriceList = this.$itemPriceListTemplate.clone();
          let itemColor = item.variant_options[1];

          if(itemColor) {
            $.ajax({
              url: '/products/'+item.handle,
              dataType: 'json',
              async: false,
              success: function(result) {
                let product = result.product;
                let images = product.images;

                for(let i = 0; i < images.length; i++) {
                  if(images[i].alt === itemColor) {
                    item.featured_image.alt = itemColor;
                    item.featured_image.url = images[i].src;
                    break;
                  }
                }
              }
            });
          }

          this._setLineItemAttributes($item, item, index);
          this._setLineItemImage($item, item.featured_image);

          $(selectors.cartItemVendor, $item)
            .text(item.vendor);

          $(selectors.cartItemTitle, $item)
            .text(item.product_title)
            .attr('href', item.url);

          var productDetailsList = this._createProductDetailsList(
            item.product_has_only_default_variant,
            item.options_with_values,
            item.properties
          );
          this._setProductDetailsList($item, productDetailsList);

          this._setItemRemove($item, item.title);

          $itemPriceList.html(
            this._createItemPrice(
              item.original_price,
              item.final_price,
              this.$itemPriceListTemplate
            )
          );

          if (item.unit_price_measurement) {
            $itemPriceList.append(
              this._createUnitPrice(
                item.unit_price,
                item.unit_price_measurement,
                this.$itemPriceListTemplate
              )
            );
          }

          this._setItemPrice($item, $itemPriceList);

          var itemDiscountList = this._createItemDiscountList(item);
          this._setItemDiscountList($item, itemDiscountList);

          this._setQuantityInputs($item, item, index);

          var itemLinePrice = this._createItemPrice(
            item.original_line_price,
            item.final_line_price,
            this.$itemLinePriceTemplate
          );
          this._setItemLinePrice($item, itemLinePrice);

          return $item[0];
        }.bind(this)
      );
    },

    _setLineItemAttributes: function($item, item, index) {
      $item
        .attr(attributes.cartItemKey, item.key)
        .attr(attributes.cartItemUrl, item.url)
        .attr(attributes.cartItemTitle, item.title)
        .attr(attributes.cartItemIndex, index + 1)
        .attr(attributes.cartItemQuantity, item.quantity);
    },

    _setLineItemImage: function($item, featuredImage) {
      var $image = $(selectors.cartItemImage, $item);

      var sizedImageUrl =
        featuredImage.url !== null
          ? theme.Images.getSizedImageUrl(featuredImage.url, 'x190')
          : null;

      if (sizedImageUrl) {
        $image
          .attr('alt', featuredImage.alt)
          .attr('src', sizedImageUrl)
          .removeClass(classes.hide);
      } else {
        $image.remove();
      }
    },

    _setProductDetailsList: function($item, productDetailsList) {
      var $itemDetails = $(selectors.cartItemDetails, $item);

      if (productDetailsList.length === 0) {
        $itemDetails.addClass(classes.hide).text('');
      } else {
        $itemDetails.removeClass(classes.hide).html(productDetailsList);
      }
    },

    _setItemPrice: function($item, price) {
      $(selectors.cartItemPrice, $item).html(price);
    },

    _setItemDiscountList: function($item, discountList) {
      var $itemDiscountList = $(selectors.cartItemDiscountList, $item);

      if (discountList.length === 0) {
        $itemDiscountList.html('').addClass(classes.hide);
      } else {
        $itemDiscountList.html(discountList).removeClass(classes.hide);
      }
    },

    _setItemRemove: function($item, title) {
      $(selectors.cartRemove, $item).attr(
        'aria-label',
        theme.strings.removeLabel.replace('[product]', title)
      );
    },

    _setQuantityInputs: function($item, item, index) {
      $(selectors.quantityInputMobile, $item)
        // .attr('id', 'updates_' + item.key)
        .attr('id', 'updates_' + item.id)
        .attr(attributes.quantityItem, index + 1)
        .val(item.quantity);

      $(selectors.quantityInputDesktop, $item)
        // .attr('id', 'updates_large_' + item.key)
        .attr('id', 'updates_large_' + item.id)
        .attr(attributes.quantityItem, index + 1)
        .val(item.quantity);

      $(selectors.quantityInputDesktop, $item)
        .parent().find('.minus button')
        .attr('data-field', 'updates_large_' + item.id);
      $(selectors.quantityInputDesktop, $item)
        .parent().find('.plus button')
        .attr('data-field', 'updates_large_' + item.id);

      $(selectors.quantityLabelMobile, $item).attr(
        'for',
        'updates_' + item.key
      );

      $(selectors.quantityLabelDesktop, $item).attr(
        'for',
        'updates_large_' + item.key
      );
    },

    setQuantityFormControllers: function() {
      if (this.mql.matches) {
        $(selectors.quantityInputDesktop).attr('name', 'updates[]');
        $(selectors.quantityInputMobile).removeAttr('name');
      } else {
        $(selectors.quantityInputMobile).attr('name', 'updates[]');
        $(selectors.quantityInputDesktop).removeAttr('name');
      }
    },

    _setItemLinePrice: function($item, price) {
      $(selectors.cartItemLinePrice, $item).html(price);
    },

    _createProductDetailsList: function(
      product_has_only_default_variant,
      options,
      properties
    ) {
      var optionsPropertiesHTML = [];

      if (!product_has_only_default_variant) {
        optionsPropertiesHTML = optionsPropertiesHTML.concat(
          this._getOptionList(options)
        );
      }

      if (properties !== null && Object.keys(properties).length !== 0) {
        optionsPropertiesHTML = optionsPropertiesHTML.concat(
          this._getPropertyList(properties)
        );
      }

      return optionsPropertiesHTML;
    },

    _getOptionList: function(options) {
      return $.map(
        options,
        function(option) {
          var $optionElement = this.$itemOptionTemplate.clone();

          $optionElement
            .text(option.name + ': ' + option.value)
            .removeClass(classes.hide);

          return $optionElement[0];
        }.bind(this)
      );
    },

    _getPropertyList: function(properties) {
      var propertiesArray =
        properties !== null ? Object.entries(properties) : [];

      return $.map(
        propertiesArray,
        function(property) {
          var $propertyElement = this.$itemPropertyTemplate.clone();

          // Line item properties prefixed with an underscore are not to be displayed
          if (property[0].charAt(0) === '_') return;

          // if the property value has a length of 0 (empty), don't display it
          if (property[1].length === 0) return;

          $propertyElement
            .find(selectors.cartItemPropertyName)
            .text(property[0]);

          if (property[0].indexOf('/uploads/') === -1) {
            $propertyElement
              .find(selectors.cartItemPropertyValue)
              .text(': ' + property[1]);
          } else {
            $propertyElement
              .find(selectors.cartItemPropertyValue)
              .html(
                ': <a href="' +
                property[1] +
                '"> ' +
                property[1].split('/').pop() +
                '</a>'
              );
          }

          $propertyElement.removeClass(classes.hide);

          return $propertyElement[0];
        }.bind(this)
      );
    },

    _createItemPrice: function(original_price, final_price, $priceTemplate) {
      if (original_price !== final_price) {
        var $discountedPrice = $(
          selectors.cartItemDiscountedPriceGroup,
          $priceTemplate
        ).clone();

        $(selectors.cartItemOriginalPrice, $discountedPrice).html(
          theme.Currency.formatMoney(original_price, theme.moneyFormat)
        );
        $(selectors.cartItemFinalPrice, $discountedPrice).html(
          theme.Currency.formatMoney(final_price, theme.moneyFormat)
        );
        $discountedPrice.removeClass(classes.hide);

        return $discountedPrice[0];
      } else {
        var $regularPrice = $(
          selectors.cartItemRegularPriceGroup,
          $priceTemplate
        ).clone();

        $(selectors.cartItemRegularPrice, $regularPrice).html(
          theme.Currency.formatMoney(original_price, theme.moneyFormat)
        );

        $regularPrice.removeClass(classes.hide);

        return $regularPrice[0];
      }
    },

    _createUnitPrice: function(
      unitPrice,
      unitPriceMeasurement,
      $itemPriceGroup
    ) {
      var $unitPriceGroup = $(
        selectors.unitPriceGroup,
        $itemPriceGroup
      ).clone();

      var unitPriceBaseUnit =
        (unitPriceMeasurement.reference_value !== 1
          ? unitPriceMeasurement.reference_value
          : '') + unitPriceMeasurement.reference_unit;

      $(selectors.unitPriceBaseUnit, $unitPriceGroup).text(unitPriceBaseUnit);
      $(selectors.unitPrice, $unitPriceGroup).html(
        theme.Currency.formatMoney(unitPrice, theme.moneyFormat)
      );

      $unitPriceGroup.removeClass(classes.hide);

      return $unitPriceGroup[0];
    },

    _createItemDiscountList: function(item) {
      return $.map(
        item.line_level_discount_allocations,
        function(discount) {
          var $discount = this.$itemDiscountTemplate.clone();
          $discount
            .find(selectors.cartItemDiscountTitle)
            .text(discount.discount_application.title);
          $discount
            .find(selectors.cartItemDiscountAmount)
            .html(
              theme.Currency.formatMoney(discount.amount, theme.moneyFormat)
            );
          return $discount[0];
        }.bind(this)
      );
    },

    _showQuantityErrorMessages: function(itemElement) {
      $(selectors.cartQuantityErrorMessage, itemElement).text(
        theme.strings.quantityMinimumMessage
      );

      $(selectors.cartQuantityErrorMessageWrapper, itemElement).removeClass(
        classes.hide
      );

      $(selectors.inputQty, itemElement)
        .addClass(classes.inputError)
        .focus();
    },

    _showStockErrorMessages: function(itemElement) {
      $('#'+itemElement.context.id).parent().parent().find('[data-cart-stock-error-message]').text(
        theme.strings.stockLimitMessage
      );

      // $(selectors.cartStockErrorMessage, itemElement).text(
      //   theme.strings.stockLimitMessage
      // );

      $('#'+itemElement.context.id).parent().parent().find('[data-cart-stock-error-message-wrapper]').removeClass(
        classes.hide
      );

      // $(selectors.cartStockErrorMessageWrapper, itemElement).removeClass(
      //   classes.hide
      // );

      $(selectors.inputQty, itemElement)
        .addClass(classes.inputError)
        .focus();
    },

    _hideQuantityErrorMessage: function() {
      var $errorMessages = $(
        selectors.cartQuantityErrorMessageWrapper
      ).addClass(classes.hide);

      $(selectors.cartQuantityErrorMessage, $errorMessages).text('');

      $(selectors.inputQty, this.$container).removeClass(classes.inputError);
    },

    _handleThumbnailClick: function(evt) {
      var url = $(evt.target)
        .closest(selectors.cartItem)
        .data('cart-item-url');

      window.location.href = url;
    },

    _onNoteChange: function(evt) {
      var note = evt.currentTarget.value;
      this._hideCartError();
      this._hideQuantityErrorMessage();

      var params = {
        url: '/cart/update.js',
        data: { note: note },
        dataType: 'json'
      };

      $.post(params).fail(
        function() {
          this._showCartError(evt.currentTarget);
        }.bind(this)
      );
    },

    _showCartError: function(elementToFocus) {
      $(selectors.cartErrorMessage).text(theme.strings.cartError);

      $(selectors.cartErrorMessageWrapper).removeClass(classes.hide);

      elementToFocus.focus();
    },

    _hideCartError: function() {
      $(selectors.cartErrorMessageWrapper).addClass(classes.hide);
      $(selectors.cartErrorMessage).text('');
    },

    _onRemoveItem: function(evt) {
      evt.preventDefault();
      var $remove = $(evt.target);
      var $lineItem = $remove.closest(selectors.cartItem);
      var index = $lineItem.attr(attributes.cartItemIndex);
      this._hideCartError();

      var params = {
        url: '/cart/change.js',
        data: { quantity: 0, line: index },
        dataType: 'json'
      };

      $.post(params)
        .done(
          function(state) {
            if (state.item_count === 0) {
              this._emptyCart();
            } else {
              this._createCart(state);
              this._setShippingInfo(state);
              this._showRemoveMessage($lineItem.clone());
            }

            this._setCartCountBubble(state.item_count);
          }.bind(this)
        )
        .fail(
          function() {
            this._showCartError(null);
          }.bind(this)
        );
    },

    _showRemoveMessage: function(lineItem) {
      var index = lineItem.data('cart-item-index');
      var removeMessage = this._getRemoveMessage(lineItem);
      var $lineItemAtIndex;

      if (index - 1 === 0) {
        $lineItemAtIndex = $('[data-cart-item-index="1"]', this.$container);
        $(removeMessage).insertBefore($lineItemAtIndex);
      } else {
        $lineItemAtIndex = $(
          '[data-cart-item-index="' + (index - 1) + '"]',
          this.$container
        );
        removeMessage.insertAfter($lineItemAtIndex);
      }
      removeMessage.focus();
    },

    _getRemoveMessage: function(lineItem) {
      var formattedMessage = this._formatRemoveMessage(lineItem);

      var $tableCell = $(selectors.cartTableCell, lineItem).clone();
      $tableCell
        .removeClass()
        .addClass(classes.cartRemovedProduct)
        .attr('colspan', '4')
        .html(formattedMessage);

      lineItem
        .attr('role', 'alert')
        .html($tableCell)
        .attr('tabindex', '-1');

      return lineItem;
    },

    _formatRemoveMessage: function(lineItem) {
      var quantity = lineItem.data('cart-item-quantity');
      var url = lineItem.attr(attributes.cartItemUrl);
      var title = lineItem.attr(attributes.cartItemTitle);

      return theme.strings.removedItemMessage
        .replace('[quantity]', quantity)
        .replace(
          '[link]',
          '<a ' +
          'href="' +
          url +
          '" class="text-link text-link--accent">' +
          title +
          '</a>'
        );
    },

    _setCartCountBubble: function(quantity) {
      this.$cartCountBubble =
        this.$cartCountBubble || $(selectors.cartCountBubble);
      this.$cartCount = this.$cartCount || $(selectors.cartCount);

      if (quantity > 0) {
        this.$cartCountBubble.removeClass(classes.hide);
        this.$cartCount.html(quantity);
      } else {
        this.$cartCountBubble.addClass(classes.hide);
        this.$cartCount.html('');
      }
    },

    _emptyCart: function() {
      this.$emptyPageContent =
        this.$emptyPageContent ||
        $(selectors.emptyPageContent, this.$container);
      this.$cartWrapper =
        this.$cartWrapper || $(selectors.cartWrapper, this.$container);

      this.$emptyPageContent.removeClass(classes.hide);
      this.$cartWrapper.addClass(classes.hide);
    },

    _setShippingInfo: function(state) {
      // Shipping info
      if (state.total_price < 7500) {
        $('.cart__footer__shipping')
          .html('<p>Spend <strong>' + theme.Currency.formatMoney(7500 - state.total_price) + '</strong> more to get<br><strong>FREE US SHIPPING</strong></p>');
      } else {
        $('.cart__footer__shipping').html('<p>You qualify for <strong>FREE US SHIPPING</strong></p>');
      }
    },

    cookiesEnabled: function() {
      var cookieEnabled = navigator.cookieEnabled;

      if (!cookieEnabled) {
        document.cookie = 'testcookie';
        cookieEnabled = document.cookie.indexOf('testcookie') !== -1;
      }
      return cookieEnabled;
    }
  });

  return Cart;
})();

/* ================ MODULES ================ */
window.theme = window.theme || {};

theme.MobileNav = (function() {
  var classes = {
    mobileNavOpenIcon: 'mobile-nav--open',
    mobileNavCloseIcon: 'mobile-nav--close',
    navLinkWrapper: 'mobile-nav__item',
    navLink: 'mobile-nav__link',
    subNavLink: 'mobile-nav__sublist-link',
    return: 'mobile-nav__return-btn',
    subNavActive: 'is-active',
    subNavClosing: 'is-closing',
    navOpen: 'js-menu--is-open',
    subNavShowing: 'sub-nav--is-open',
    thirdNavShowing: 'third-nav--is-open',
    subNavToggleBtn: 'js-toggle-submenu'
  };
  var cache = {};
  var isTransitioning;
  var $activeSubNav;
  var $activeTrigger;
  var menuLevel = 1;
  // Breakpoints from src/stylesheets/global/variables.scss.liquid
  var mediaQuerySmall = 'screen and (max-width: 749px)';

  function init() {
    cacheSelectors();

    cache.$mobileNavToggle.on('click', toggleMobileNav);
    cache.$subNavToggleBtn.on('click.subNav', toggleSubNav);

    // Close mobile nav when unmatching mobile breakpoint
    enquire.register(mediaQuerySmall, {
      unmatch: function() {
        if (cache.$mobileNavContainer.hasClass(classes.navOpen)) {
          closeMobileNav();
        }
      }
    });

    $(document).on('click', 'body.showMobileMenu', function() {
      closeMobileNav();
    });

    $('.site-header__menu, .mobile-nav-wrapper').click(function(event){
      event.stopPropagation();
    });
  }

  function toggleMobileNav() {
    if (cache.$mobileNavToggle.hasClass(classes.mobileNavCloseIcon)) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  }

  function cacheSelectors() {
    cache = {
      $pageContainer: $('#PageContainer'),
      $siteHeader: $('.site-header'),
      $mobileNavToggle: $('.js-mobile-nav-toggle'),
      $mobileNavContainer: $('.mobile-nav-wrapper'),
      $mobileNav: $('#MobileNav'),
      $sectionHeader: $('#shopify-section-header'),
      $subNavToggleBtn: $('.' + classes.subNavToggleBtn)
    };
  }

  function openMobileNav() {
    var translateHeaderHeight = cache.$siteHeader.outerHeight();

    $('body').addClass('showMobileMenu');

    cache.$mobileNavContainer.prepareTransition().addClass(classes.navOpen);

    cache.$mobileNavContainer.css({
      // transform: 'translateY(' + translateHeaderHeight + 'px)'
      transform: 'translateX(0)'
    });

    // console.log(cache.$mobileNavContainer[0]);
    cache.$pageContainer.css({
      transform:
        'translate3d(0, ' + cache.$mobileNavContainer[0].scrollHeight + 'px, 0)'
    });

    cache.$mobileNavToggle
      .addClass(classes.mobileNavCloseIcon)
      .removeClass(classes.mobileNavOpenIcon)
      .attr('aria-expanded', true);

    // close on escape
    $(window).on('keyup.mobileNav', function(evt) {
      if (evt.which === 27) {
        closeMobileNav();
      }
    });
  }

  function closeMobileNav() {
    $('body').removeClass('showMobileMenu');

    cache.$mobileNavContainer.prepareTransition().removeClass(classes.navOpen);

    cache.$mobileNavContainer.css({
      transform: 'translateX(-103%)'
    });

    cache.$pageContainer.removeAttr('style');

    cache.$mobileNavToggle
      .addClass(classes.mobileNavOpenIcon)
      .removeClass(classes.mobileNavCloseIcon)
      .attr('aria-expanded', false)
      .focus();

    $(window).off('keyup.mobileNav');

    //scrollTo(0, 0);
  }

  function toggleSubNav(evt) {
    if (isTransitioning) {
      return;
    }

    var $toggleBtn = $(evt.currentTarget);
    var isReturn = $toggleBtn.hasClass(classes.return);
    isTransitioning = true;

    if (isReturn) {
      // Close all subnavs by removing active class on buttons
      $(
        '.' + classes.subNavToggleBtn + '[data-level="' + (menuLevel - 1) + '"]'
      ).removeClass(classes.subNavActive);

      if ($activeTrigger && $activeTrigger.length) {
        $activeTrigger.removeClass(classes.subNavActive);
      }
    } else {
      $toggleBtn.addClass(classes.subNavActive);
    }

    $activeTrigger = $toggleBtn;

    goToSubnav($toggleBtn.data('target'));
  }

  function goToSubnav(target) {
    /*eslint-disable shopify/jquery-dollar-sign-reference */

    var $targetMenu = target
      ? $('.mobile-nav__dropdown[data-parent="' + target + '"]')
      : cache.$mobileNav;

    menuLevel = $targetMenu.data('level') ? $targetMenu.data('level') : 1;

    if ($activeSubNav && $activeSubNav.length) {
      $activeSubNav.prepareTransition().addClass(classes.subNavClosing);
    }

    $activeSubNav = $targetMenu;

    /*eslint-enable shopify/jquery-dollar-sign-reference */

    var translateMenuHeight = $targetMenu.outerHeight();
    if(menuLevel == 1) { translateMenuHeight = 'auto'; }

    var openNavClass =
      menuLevel > 2 ? classes.thirdNavShowing : classes.subNavShowing;

    cache.$mobileNavContainer
      .css('height', translateMenuHeight)
      .css('max-height', $(window).height())
      .removeClass(classes.thirdNavShowing)
      .addClass(openNavClass);

    if (!target) {
      // Show top level nav
      cache.$mobileNavContainer
        .removeClass(classes.thirdNavShowing)
        .removeClass(classes.subNavShowing);
    }

    /* if going back to first subnav, focus is on whole header */
    var $container = menuLevel === 1 ? cache.$sectionHeader : $targetMenu;

    var $menuTitle = $targetMenu.find('[data-menu-title=' + menuLevel + ']');
    var $elementToFocus = $menuTitle ? $menuTitle : $targetMenu;

    // Focusing an item in the subnav early forces element into view and breaks the animation.
    cache.$mobileNavContainer.one(
      'TransitionEnd.subnavToggle webkitTransitionEnd.subnavToggle transitionend.subnavToggle oTransitionEnd.subnavToggle',
      function() {
        // slate.a11y.trapFocus({
        //   $container: $container,
        //   $elementToFocus: $elementToFocus,
        //   namespace: 'subNavFocus'
        // });

        cache.$mobileNavContainer.off('.subnavToggle');
        isTransitioning = false;
      }
    );

    // Match height of subnav
    cache.$pageContainer.css({
      transform: 'translateY(' + translateMenuHeight + 'px)'
    });

    $activeSubNav.removeClass(classes.subNavClosing);
  }

  return {
    init: init,
    closeMobileNav: closeMobileNav
  };
})(jQuery);

window.theme = window.theme || {};
theme.Sections = function Sections() {
  this.constructors = {};
  this.instances = [];

  $(document)
    .on('shopify:section:load', this._onSectionLoad.bind(this))
    .on('shopify:section:unload', this._onSectionUnload.bind(this))
    .on('shopify:section:select', this._onSelect.bind(this))
    .on('shopify:section:deselect', this._onDeselect.bind(this))
    .on('shopify:block:select', this._onBlockSelect.bind(this))
    .on('shopify:block:deselect', this._onBlockDeselect.bind(this));
};

theme.Sections.prototype = _.assignIn({}, theme.Sections.prototype, {
  _createInstance: function(container, constructor) {
    var $container = $(container);
    var id = $container.attr('data-section-id');
    var type = $container.attr('data-section-type');

    constructor = constructor || this.constructors[type];

    if (_.isUndefined(constructor)) {
      return;
    }

    var instance = _.assignIn(new constructor(container), {
      id: id,
      type: type,
      container: container
    });

    this.instances.push(instance);
  },

  _onSectionLoad: function(evt) {
    var container = $('[data-section-id]', evt.target)[0];
    if (container) {
      this._createInstance(container);
    }
  },

  _onSectionUnload: function(evt) {
    this.instances = _.filter(this.instances, function(instance) {
      var isEventInstance = (instance.id === evt.detail.sectionId);

      if (isEventInstance) {
        if (_.isFunction(instance.onUnload)) {
          instance.onUnload(evt);
        }
      }

      return !isEventInstance;
    });
  },

  _onSelect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onSelect)) {
      instance.onSelect(evt);
    }
  },

  _onDeselect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onDeselect)) {
      instance.onDeselect(evt);
    }
  },

  _onBlockSelect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onBlockSelect)) {
      instance.onBlockSelect(evt);
    }
  },

  _onBlockDeselect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onBlockDeselect)) {
      instance.onBlockDeselect(evt);
    }
  },

  register: function(type, constructor) {
    this.constructors[type] = constructor;

    $('[data-section-type=' + type + ']').each(function(index, container) {
      this._createInstance(container, constructor);
    }.bind(this));
  }
});

window.slate = window.slate || {};

window.theme = window.theme || {};
theme.smoothScroll = function() {
  $('a[href*="#"]:not([href="#"])').click(function(event) {
    if( $(this).parent().hasClass('ui-tabs-tab') === false ){
      if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') || location.hostname == this.hostname) {
        let target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
        if (target.length) {
          event.preventDefault();
          $('html,body').animate({
            scrollTop: target.offset().top
          }, 1000);
        }
      }
    }
  });
};

theme.Product = (function() {

  // PDP - main slider
  let mediaData = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    infinite: false,
    centerMode: false,
    asNavFor: '.product-single__thumbnails-wrapper ul',
    prevArrow: '<button type="button" class="slick-prev" aria-label="Previous"><span>Prev</span></button>',
    nextArrow: '<button type="button" class="slick-next" aria-label="Next"><span>Next</span></button>',
    responsive: [
      {
        breakpoint: 736,
        settings: {
          arrows: true,
          dots: true
        }
      }
    ]
  };
  let thumbnailsData = {
    asNavFor: '.product-single__media-wrapper',
    dots: false,
    arrows: false,
    vertical: true,
    infinite: false,
    centerMode: true,
    focusOnSelect: true,
    slidesToShow: 6,
    slidesToScroll: 1,
    prevArrow: '<button type="button" class="slick-prev" aria-label="Previous"><span>Prev</span></button>',
    nextArrow: '<button type="button" class="slick-next" aria-label="Next"><span>Next</span></button>',
    responsive: [
      {
        breakpoint: 1281,
        settings: {
          vertical: false,
          centerMode: false,
          slidesToShow: 4
        }
      }
    ]
  };
  function pdpSlider(){
    $('.product-single__media-wrapper').slick(mediaData);
    $('.product-single__thumbnails-wrapper ul').slick(thumbnailsData);

    $('.product-single__media-wrapper').on('afterChange', function(event, slick, currentSlide, nextSlide){
      let video = $(document).find('.product-single__media-wrapper .slick-slide').eq(currentSlide).find('video');
      if (video.length > 0) video.get(0).play();
    });
  }pdpSlider();

  function doZoomProductSingleMedia() {
    $('.product-single__media__zoom.image').magnificPopup({
      type: 'image',
      closeBtnInside: true,
      fixedContentPos: true,
      fixedBgPos: true,
      mainClass: 'mfp-modal-zoom',
      callbacks: {
        open: function() {
          $('.mfp-figure figure').zoom();
        }
      }
    });
    $('.product-single__media__zoom.video').magnificPopup({
      type: 'iframe',
      closeBtnInside: true,
      fixedContentPos: true,
      fixedBgPos: true,
      mainClass: 'mfp-modal-zoom',
      callbacks: {
        open: function() {
          $('.mfp-figure figure').zoom();
        }
      }
    });
    $('.product-single__video a').magnificPopup({
      type: 'inline',
      closeBtnInside: false,
      fixedContentPos: true,
      fixedBgPos: true,
      midClick: true,
      callbacks: {
        open: function () {
          let video = $(document).find('#product-single__video video');
          if (video.length > 0) video.get(0).play();
        }
      }
    });
  }doZoomProductSingleMedia();

  // PDP
  let currentColor = $('#SingleOptionSelector-1').prev().find('.active').text();
  let currentOption3 = $('#SingleOptionSelector-2').prev().find('.active').text();


  $( document ).on( 'click', '.product-form ul li:not(.disable)', function(){
    $(this).parent().find( "li" ).removeClass( "active" );
    $(this).addClass( "active" ).parent().prev().text($(this).data( "value" ));
    $(this).parent().next().val($(this).data( "value" )).trigger('change');

    if(currentColor) {
      currentColor = $('#SingleOptionSelector-1').prev().find('.active').text();
      checkSizes(currentColor, currentOption3);
      changeProductImage(currentColor);
    }

    $('.product-form__cart-submit').find('span[data-add-to-cart-text]').text('Add to Cart');
  });

  if(currentColor){
    function checkSizes(currentColor, currentOption3 = '') {
      $('.product-form__cart-submit').attr('disabled', true);

      let selectId = $('#ProductSelect-product-template');
      let sizes = $('#SingleOptionSelector-0').prev();
      $(sizes).children('li').addClass('disable');
      $(sizes).children('li').each(function() {
        let _thisSize = $(this);
        let size = $(this).text();
        $(selectId).children('option').each(function() {
          let str = $.trim($(this).text());
          let pdpOptions = size + ' / ' + currentColor;
          if(currentOption3) {
            pdpOptions = size + ' / ' + currentColor + ' / ' + currentOption3;
          }
          if (str === pdpOptions) {
            _thisSize.removeClass('disable');

            if(_thisSize.hasClass('active')) {
              $('.product-form__cart-submit').attr('disabled', false);
            }
          }
        });
      });

      if($(sizes).find('li.active.disable').length > 0) {
        $(sizes).find('li.active.disable').removeClass('active')
        $(sizes).children('li').eq(0).trigger('click');
      }
    }
    checkSizes(currentColor, currentOption3);

    function changeProductImage(currentColor) {
      $('.product-single__media-wrapper').slick('destroy').html('');
      $('.product-single__thumbnails-wrapper ul').slick('destroy').html('');

      if($(document).find('[data-product-slides-json]').length !== 0){
        let json = JSON.parse($('[data-product-slides-json]').html());
        let slides = json.slides;
        let videoSlide = '';
        let videoSlideThumbnail = '';
        $('.product-single__video').addClass('hidden');

        if( slides !== '' ){
          _.forEach(slides, function(value, key) {
            if( currentColor === value.image_alt ) {
              if( value.type === 'image' ) {
                $('.product-single__media-wrapper').append('<div data-color="'+ value.image_alt +'"><div class="product-single__media"><a href="'+ value.image_zoom +'" class="product-single__media__zoom '+ value.type +'"><img src="'+ value.image_master +'" alt=""></a></div></div>');
                $('.product-single__thumbnails-wrapper ul').append('<li class="product-single__thumbnails-item" data-color="'+ value.image_alt +'"><span><img src="'+ value.image_thumbnail +'" alt=""></span></li>');
              } else {
                videoSlide = '<div data-color="'+ value.image_alt +'"><div class="product-single__media nobg"><video controls="controls" preload="metadata" height="688" class="inline-block" style="height:688px"><source src="'+ value.image_zoom +'" type="video/mp4"></video></div></div>';
                videoSlideThumbnail = '<li class="product-single__thumbnails-item" data-color="'+ value.image_alt +'"><span class="'+ value.type +'"><img src="'+ value.image_thumbnail +'" alt=""></span></li>';
                $('.product-single__media-wrapper').append(videoSlide);
                $('.product-single__thumbnails-wrapper ul').append(videoSlideThumbnail);
                $('.product-single__video').removeClass('hidden');
                $('.product-single__video div').html('').append('<video controls="controls" preload="metadata" aria-label="Cognac"><source src="'+ value.image_zoom +'" type="video/mp4"></video>');
              }
            }
          });
        }
      }

      $('.product-single__media-wrapper').slick(mediaData);
      $('.product-single__thumbnails-wrapper ul').slick(thumbnailsData);

      if ($(window).width() < 736) {
        $('.product-single__media-wrapper').slick('slickRemove', $('.product-single__media-wrapper li').length - 1);
        $('.product-single__thumbnails-wrapper ul').slick('slickRemove', $('.product-single__thumbnails-wrapper ul').length - 1);
      }

      doZoomProductSingleMedia();
    }
    changeProductImage(currentColor);
  }

  $( ".product-single__summary__info" ).accordion({
    collapsible : true,
    active : 0,
    header: "h3",
    heightStyle: "content",
    activate: function( event, ui ) {
      // Remove empty attr in text
      let $liAttr = [
        "Manufacturer",
        "Manufacturer Color",
        "Condition",
        "Style Type",
        "Collection",
        "Model Number",
        "MPN",
        "Features",
        "Includes",
        "Material",
        "Number of Pieces",
        "Dimensions",
        "Specialty",
        "Size",
        "Closure",
        "Gender",
        "Pattern",
        "Fabric Type",
        "Aromatherapy Scent",
        "Sport",
        "Apparel Style",
        "Sleeve Length",
        "Inseam",
        "Rise",
        "Type of Carrier",
        "Shoe Width",
        "Features & Fastening",
        "Recommended Age Range",
        "Handle Type",
        "Compartment",
        "Bag Height Inches",
        "Bag Length Inches",
        "Bag Depth Inches",
        "Bake Shape",
        "Non-Stick",
        "Quantity",
        "Age",
        "Ball Size",
        "Bat Weight",
        "Length",
        "Pillow Size",
        "Width",
        "Insert Material",
        "Room",
        "Bedding Size",
        "Drop Length",
        "Size Origin",
        "Application",
        "Max Magnification",
        "Watts",
        "Blind Length",
        "Blind Width",
        "Heel Height",
        "Heel Height Inches",
        "Platform Height",
        "Platform Height Inches",
        "Shaft Height Inches",
        "Shaft Width Inches",
        "Vibrates",
        "Occasion",
        "Season",
        "Neckline",
        "Strap Drop Inches",
        "Scent Type",
        "Specific Scent",
        "Candle Size",
        "Description",
        "Dispenser",
        "Requires",
        "Material Specialty",
        "RoomMaterial",
        "Seating Direction",
        "Type",
        "Application Area",
        "Application Type",
        "Ounces",
        "Compatible Brand",
        "Theme",
        "Height",
        "Form",
        "Scent",
        "Signal",
        "Additional Features",
        "Number of Cups",
        "Power",
        "RoomPattern",
        "Retail",
        "Finish",
        "Backing",
        "Style",
        "Curtain Length",
        "Curtain Width",
        "Blade Material",
        "Blade Length",
        "Shape",
        "Silhouette",
        "Fit",
        "Vents",
        "Denim Wash",
        "Pant Type",
        "Bottom Closure",
        "Front Style",
        "Jacket Length",
        "Waist Across",
        "Hips Across",
        "Leg Opening",
        "Bust Across",
        "Total Length",
        "Fur Type",
        "Back Pockets",
        "Total Jacket Length",
        "Jacket Sleeve Length",
        "Dress Length",
        "Platform Height (Inches)",
        "Shaft Width (Inches)",
        "Set",
        "Swimwear Top",
        "Cup Size",
        "Straps",
        "Collar",
        "Swimwear Bottom",
        "Back Coverage",
        "Padding",
        "Swimwear Bottom",
        "Back Coverage"
      ];

      let $liData = [];
      _.forEach($liAttr, function(value, key) {
        $liData.push('<strong>'+value+':</strong>');
        $liData.push('<strong>'+value+': </strong>');
        $liData.push('<strong>'+value+':</strong>Inches');

        // $liData.push('<b>'+value+'</b>');
        // $liData.push('<b>'+value+' </b>');
        //
        // if(value == 'Heel Height:' || value == 'Platform Height:') {
        //   $liData.push('<strong>'+value+'</strong>Inches');
        //   $liData.push('<strong>'+value+' </strong>Inches');
        //   $liData.push('<b>'+value+'</b>Inches');
        //   $liData.push('<b>'+value+' </b>Inches');
        // }
      });

      $.each($(".description ul li"), function (key, value) {
        let $li = value.innerHTML;
        $li = $li.replace('<br>','').replace('\n','').trim();

        if($liData.includes($li)) {
          $(this).addClass('hidden');
        }
      });
    }
  });

  function Product(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    this.ajaxEnabled = $container.data('ajax-enabled');

    this.settings = {
      // Breakpoints from src/stylesheets/global/variables.scss.liquid
      mediaQueryMediumUp: 'screen and (min-width: 750px)',
      mediaQuerySmall: 'screen and (max-width: 749px)',
      bpSmall: false,
      enableHistoryState: $container.data('enable-history-state') || false,
      imageSize: null,
      imageZoomSize: null,
      namespace: '.slideshow-' + sectionId,
      sectionId: sectionId,
      sliderActive: false,
      zoomEnabled: false
    };

    this.selectors = {
      addToCart: '#AddToCart-' + sectionId,
      addToCartText: '#AddToCartText-' + sectionId,
      addToCartPreorderInfo: '#AddToCartPreorderInfo-' + sectionId,
      comparePrice: '#ComparePrice-' + sectionId,
      originalPrice: '#ProductPrice-' + sectionId,
      singleDiscount: '.product-single__discount',
      priceDiscount: '.product-price__discount',
      SKU: '.variant-sku',
      originalPriceWrapper: '.product-price__price-' + sectionId,
      originalSelectorId: '#ProductSelect-' + sectionId,
      productFeaturedImage: '#FeaturedImage-' + sectionId,
      productImageWrap: '#FeaturedImageZoom-' + sectionId,
      productPrices: '.product-single__price-' + sectionId,
      productThumbImages: '.product-single__thumbnail--' + sectionId,
      productThumbs: '.product-single__thumbnails-' + sectionId,
      saleClasses: 'product-price__sale product-price__sale--single',
      saleLabel: '.product-price__sale-label-' + sectionId,
      singleOptionSelector: '.single-option-selector-' + sectionId,
      productForm: '[data-product-form]',
      submitButton: '.product-form__cart-submit'
    }

    this.classes = {
      cartPopupWrapperHidden: 'cart-popup-wrapper--hidden',
      hidden: 'hidden',
      visibilityHidden: 'visibility-hidden',
      inputError: 'input--error',
      productOnSale: 'price--on-sale',
      productUnitAvailable: 'price--unit-available',
      productUnavailable: 'price--unavailable',
      productSoldOut: 'price--sold-out',
      cartImage: 'cart-popup-item__image',
      productFormErrorMessageWrapperHidden:
        'product-form__error-message-wrapper--hidden',
      activeClass: 'active-thumb',
      variantSoldOut: 'product-form--variant-sold-out'
    }

    this.$quantityInput = $(this.selectors.quantity, $container);
    this.$errorMessageWrapper = $(
      this.selectors.errorMessageWrapper,
      $container
    );
    this.$addToCart = $(this.selectors.addToCart, $container);
    this.$addToCartText = $(this.selectors.addToCartText, this.$addToCart);
    this.$shopifyPaymentButton = $(
      this.selectors.shopifyPaymentButton,
      $container
    );
    this.$productPolicies = $(this.selectors.productPolicies, $container);

    this.$loader = $(this.selectors.loader, this.$addToCart);
    this.$loaderStatus = $(this.selectors.loaderStatus, $container);

    // Stop parsing if we don't have the product json script tag when loading
    // section in the Theme Editor
    if (!$('#ProductJson-' + sectionId).html()) {
      return;
    }

    this.productSingleObject = JSON.parse(document.getElementById('ProductJson-' + sectionId).innerHTML);

    // this.settings.zoomEnabled = $(this.selectors.productFeaturedImage).hasClass('js-zoom-enabled');
    // this.settings.imageSize = theme.Images.imageSize($(this.selectors.productFeaturedImage).attr('src'));
    //
    // if (this.settings.zoomEnabled) {
    //   this.settings.imageZoomSize = theme.Images.imageSize($(this.selectors.productImageWrap).data('zoom'));
    // }

    this._initBreakpoints();
    this._stringOverrides();
    this._initVariants();
    this._initAddToCart();
    this._initImageSwitch();
    this._setActiveThumbnail();

    // Pre-loading product images to avoid a lag when a thumbnail is clicked, or
    // when a variant is selected that has a variant image
    // theme.Images.preload(this.productSingleObject.images, this.settings.imageSize);
  }

  Product.prototype = _.assignIn({}, Product.prototype, {
    _stringOverrides: function() {
      theme.productStrings = theme.productStrings || {};
      $.extend(theme.strings, theme.productStrings);
    },

    _initBreakpoints: function() {
      var self = this;

      enquire.register(this.settings.mediaQuerySmall, {
        match: function() {
          // initialize thumbnail slider on mobile if more than three thumbnails
          if ($(self.selectors.productThumbImages).length > 3) {
            self._initThumbnailSlider();
          }

          // destroy image zooming if enabled
          if (self.settings.zoomEnabled) {
            _destroyZoom($(self.selectors.productImageWrap));
          }

          self.settings.bpSmall = true;
        },
        unmatch: function() {
          // if (self.settings.sliderActive) {
          //   self._destroyThumbnailSlider();
          // }

          self.settings.bpSmall = false;
        }
      });

      enquire.register(this.settings.mediaQueryMediumUp, {
        match: function() {
          if ($(self.selectors.productThumbImages).length > 3) {
            self._initThumbnailSlider();
          }
          if (self.settings.zoomEnabled) {
            _enableZoom($(self.selectors.productImageWrap));
          }
        }
      });
    },

    _initVariants: function() {
      var options = {
        $container: this.$container,
        enableHistoryState: this.$container.data('enable-history-state') || false,
        singleOptionSelector: this.selectors.singleOptionSelector,
        originalSelectorId: this.selectors.originalSelectorId,
        product: this.productSingleObject
      };

      this.variants = new slate.Variants(options);

      this.$container.on('variantChange' + this.settings.namespace, this._updateAddToCart.bind(this));
      // this.$container.on('variantImageChange' + this.settings.namespace, this._updateImages.bind(this));
      this.$container.on('variantPriceChange' + this.settings.namespace, this._updatePrice.bind(this));
      this.$container.on('variantSKUChange' + this.settings.namespace, this._updateSKU.bind(this));
    },

    _initAddToCart: function() {
      $(this.selectors.productForm, this.$container).on(
        'submit',
        function(evt) {
          if (this.$addToCart.is('[aria-disabled]')) {
            evt.preventDefault();
            return;
          }

          if (!this.ajaxEnabled) return;

          evt.preventDefault();

          this.$previouslyFocusedElement = $(':focus');

          var isInvalidQuantity = this.$quantityInput.val() <= 0;

          if (isInvalidQuantity) {
            this._showErrorMessage(theme.strings.quantityMinimumMessage);
            return;
          }

          if (!isInvalidQuantity && this.ajaxEnabled) {
            // disable the addToCart and dynamic checkout button while
            // request/cart popup is loading and handle loading state
            this._handleButtonLoadingState(true);
            var $data = $(this.selectors.productForm, this.$container);
            this._addItemToCart($data);
            return;
          }
        }.bind(this)
      );
    },

    _addItemToCart: function(data) {
      var params = {
        url: '/cart/add.js',
        data: $(data).serialize(),
        dataType: 'json'
      };

      $.post(params)
        .done(
          function(item) {
            this._hideErrorMessage();
            this._setupCartPopup(item);
          }.bind(this)
        )
        .fail(
          function(response) { console.log(response);
            this.$previouslyFocusedElement.focus();
            var errorMessage = response.responseJSON
              ? response.responseJSON.description
              : theme.strings.cartError;
            this._showErrorMessage(errorMessage);
            this._handleButtonLoadingState(false);
          }.bind(this)
        );
    },

    _handleButtonLoadingState: function(isLoading) {
      if (isLoading) {
        // this.$addToCart.attr('aria-disabled', true);
        // this.$addToCartText.addClass(this.classes.hidden);
        // this.$loader.removeClass(this.classes.hidden);
        // this.$shopifyPaymentButton.attr('disabled', true);
        // this.$loaderStatus.attr('aria-hidden', false);

        $(this.selectors.submitButton).attr('disabled', false).find('span[data-add-to-cart-text]').text('Add to Cart');
      } else {
        // this.$addToCart.removeAttr('aria-disabled');
        // this.$addToCartText.removeClass(this.classes.hidden);
        // this.$loader.addClass(this.classes.hidden);
        // this.$shopifyPaymentButton.removeAttr('disabled');
        // this.$loaderStatus.attr('aria-hidden', true);

        $(this.selectors.submitButton).attr('disabled', true).find('span[data-add-to-cart-text]').text('Out of stock');
      }
    },

    _showErrorMessage: function(errorMessage) {
      $(this.selectors.errorMessage, this.$container).html(errorMessage);

      if (this.$quantityInput.length !== 0) {
        this.$quantityInput.addClass(this.classes.inputError);
      }

      this.$errorMessageWrapper
        .removeClass(this.classes.productFormErrorMessageWrapperHidden)
        .attr('aria-hidden', true)
        .removeAttr('aria-hidden');
    },

    _hideErrorMessage: function() {
      this.$errorMessageWrapper.addClass(
        this.classes.productFormErrorMessageWrapperHidden
      );

      if (this.$quantityInput.length !== 0) {
        this.$quantityInput.removeClass(this.classes.inputError);
      }
    },

    _initImageSwitch: function() {
      if (!$(this.selectors.productThumbImages).length) {
        return;

      }

      var self = this;

      $(this.selectors.productThumbImages).on('click', function(evt) {
        evt.preventDefault();
        //$( "html" ).addClass( "fancybox-margin fancybox-lock" );
        $( "body" ).append( '<div class="fancybox-overlay fancybox-overlay-fixed white" style="display: block"><div id="fancybox-loading"><div></div></div></div>' );

        var $el = $(this);
        var imageSrc = $el.attr('href');
        var zoomSrc = $el.data('zoom');

        self._switchImage(imageSrc, zoomSrc);
        self._setActiveThumbnail(imageSrc);
      });
    },

    _setupCartPopup: function(item) {
      this._updateCartPopupContent(item);

      let button = '.product-form__cart-submit';

      $(button).addClass('loading').find('span[data-add-to-cart-text]').text('Added to Cart');
      setTimeout(function(){ $(button).removeClass('loading').find('span[data-add-to-cart-text]').text('Add to Cart'); }, 3000);
    },

    _updateCartPopupContent: function(item) {
      $.getJSON('/cart.js').then(
        function(cart) {
          this._showCartPopup();
        }.bind(this)
      );
    },

    _showCartPopup: function() {
      // this._handleButtonLoadingState(false);

      function getCart(){
        jQuery.ajax({
          type: 'GET',
          url: '/cart.json',
          dataType: 'jsonp',
          success: function(data) {
            jQuery('.site-header__cart-count').removeClass('hidden').find('span').text(data.item_count);
          }
        });
      } getCart();
    },

    _setActiveThumbnail: function(src) {
      var activeClass = 'active-thumb';

      // If there is no element passed, find it by the current product image
      if (typeof src === 'undefined') {
        src = $(this.selectors.productFeaturedImage).attr('src');
      }

      // Set active thumbnails (incl. slick cloned thumbs) with matching 'href'
      var $thumbnail = $(this.selectors.productThumbImages + '[href="' + src + '"]');
      $(this.selectors.productThumbImages).removeClass(activeClass);
      $thumbnail.addClass(activeClass);
    },

    _switchImage: function(image, zoomImage) {
      $(this.selectors.productFeaturedImage).attr('src', image);

      // destroy image zooming if enabled
      if (this.settings.zoomEnabled) {
        _destroyZoom($(this.selectors.productImageWrap));
      }

      if (!this.settings.bpSmall && this.settings.zoomEnabled && zoomImage) {
        $(this.selectors.productImageWrap).data('zoom', zoomImage);
        _enableZoom($(this.selectors.productImageWrap));
      }

      $( "#FeaturedImageZoom-product-template img" ).on('load', function() {
        $( ".fancybox-overlay" ).remove();
        //$( "html" ).removeClass( "fancybox-margin fancybox-lock" );
      });
    },

    _initThumbnailSlider: function() {
      var options = {
        slidesToShow: 4,
        slidesToScroll: 4,
        infinite: false,
        vertical: true,
        prevArrow: '.thumbnails-slider__prev--' + this.settings.sectionId,
        nextArrow: '.thumbnails-slider__next--' + this.settings.sectionId,
        responsive: [
          {
            breakpoint: 1209,
            settings: {
              vertical: false,
              slidesToShow: 3,
              slidesToScroll: 3
            }
          }
        ]
      };

      $(this.selectors.productThumbs).slick(options);
      this.settings.sliderActive = true;
    },

    _destroyThumbnailSlider: function() {
      $(this.selectors.productThumbs).slick('unslick');
      this.settings.sliderActive = false;
    },

    _updateAddToCart: function(evt) {
      var variant = evt.variant;

      if(evt.variant.name.indexOf("Gift Card") < 0){
        if (variant) {
          $(this.selectors.productPrices)
            .removeClass('visibility-hidden')
            .attr('aria-hidden', 'true');

          if (variant.available) {
            $(this.selectors.addToCart).prop('disabled', false);
            if (variant.inventory_quantity > 0) {

              $(this.selectors.addToCartText).text(theme.strings.addToCart);
              $(this.selectors.addToCartPreorderInfo).addClass('hidden');

            } else {
              this.productSingleObject.tags.forEach(preorderInfo, this.selectors.addToCartPreorderInfo);

              function preorderInfo(item, index) {
                let variant_title = evt.variant.title.replace(' / ', '_');
                variant_title = variant_title.replace('(', '');
                variant_title = variant_title.replace(')', '');
                variant_title = variant_title.replace(' ', '_');
                if (item.includes('preorder_' + variant_title))
                  $("#AddToCartPreorderInfo-product-template").removeClass('hidden').find('span').text(item.replace('preorder_' + variant_title + '_', ''));
              }

              $(this.selectors.addToCartText).text(theme.strings.preOrder);
            }
          } else {
            // The variant doesn't exist, disable submit button and change the text.
            // This may be an error or notice that a specific variant is not available.
            $(this.selectors.addToCart).prop('disabled', true);
            $(this.selectors.addToCartText).text(theme.strings.soldOut);
          }
        } else {
          $(this.selectors.addToCart).prop('disabled', true);
          $(this.selectors.addToCartText).text(theme.strings.unavailable);
          $(this.selectors.productPrices)
            .addClass('hidden')
            .attr('aria-hidden', 'false');
        }
      }
    },

    // _updateImages: function(evt) {
    //   var variant = evt.variant;
    //   var sizedImgUrl = theme.Images.getSizedImageUrl(variant.featured_image.src, this.settings.imageSize);
    //   var zoomSizedImgUrl;
    //
    //   if (this.settings.zoomEnabled) {
    //     zoomSizedImgUrl = theme.Images.getSizedImageUrl(variant.featured_image.src, this.settings.imageZoomSize);
    //   }
    //
    //   this._switchImage(sizedImgUrl, zoomSizedImgUrl);
    //   this._setActiveThumbnail(sizedImgUrl);
    // },

    _updatePrice: function(evt) {
      var variant = evt.variant;

      $(this.selectors.originalPrice).html(theme.Currency.formatMoney(variant.price, theme.moneyFormat));

      // Update and show the product's compare price if necessary
      if (variant.compare_at_price > variant.price) {
        $(this.selectors.comparePrice)
          .html(theme.Currency.formatMoney(variant.compare_at_price, theme.moneyFormat))
          .removeClass('hidden');

        $(this.selectors.originalPriceWrapper).addClass(this.selectors.saleClasses);

        $(this.selectors.saleLabel).removeClass('hidden');

        $(this.selectors.singleDiscount)
          .html(Math.ceil(100 - (variant.price / (variant.compare_at_price / 100))) + '% off');

        $(this.selectors.priceDiscount)
          .html(Math.ceil(100 - (variant.price / (variant.compare_at_price / 100))) + '% off');
      } else {
        // Update the product price
        $(this.selectors.comparePrice).addClass('hidden');
        $(this.selectors.saleLabel).addClass('hidden');
        $(this.selectors.originalPriceWrapper).removeClass(this.selectors.saleClasses);
      }
    },

    _updateSKU: function(evt) {
      var variant = evt.variant;

      // Update the sku
      $(this.selectors.SKU).html(variant.sku);
    },

    onUnload: function() {
      this.$container.off(this.settings.namespace);
    }
  });

  return Product;
})();

/**
 * Variant Selection scripts
 * ------------------------------------------------------------------------------
 *
 * Handles change events from the variant inputs in any `cart/add` forms that may
 * exist.  Also updates the master select and triggers updates when the variants
 * price or image changes.
 *
 * @namespace variants
 */

slate.Variants = (function() {

  /**
   * Variant constructor
   *
   * @param {object} options - Settings from `product.js`
   */
  function Variants(options) {
    this.$container = options.$container;
    this.product = options.product;
    this.singleOptionSelector = options.singleOptionSelector;
    this.originalSelectorId = options.originalSelectorId;
    this.enableHistoryState = options.enableHistoryState;
    this.currentVariant = this._getVariantFromOptions();

    $(this.singleOptionSelector, this.$container).on('change', this._onSelectChange.bind(this));
    //$(this.singleOptionSelector, this.$container).on('click', this._onSelectChange.bind(this));
  }


  Variants.prototype = _.assignIn({}, Variants.prototype, {

    /**
     * Get the currently selected options from add-to-cart form. Works with all
     * form input elements.
     *
     * @return {array} options - Values of currently selected variants
     */
    _getCurrentOptions: function() {
      var currentOptions = _.map($(this.singleOptionSelector, this.$container), function(element) {
        var $element = $(element);
        var type = $element.attr('type'); //console.log($element);
        var type2 = $element.data('list');
        var currentOption = {};

        if (type === 'radio' || type === 'checkbox') {
          if ($element[0].checked) {
            currentOption.value = $element.val();
            currentOption.index = $element.data('index');

            return currentOption;
          } else {
            return false;
          }
        } else if (type2 === 'Color' || type2 === 'Size') { // console.log($element);
          currentOption.value = $element.data('value');  console.log('currentOption.value', currentOption.value);
          currentOption.index = $element.data('index');  console.log('currentOption.index', currentOption.index);

          // let el = $element[0]['children']; //console.log($element.data('value'));
          // $(el).each(function() { //console.log($(this)['context']);
          //   if($(this).hasClass('active') == true) {
          //     currentOption.value = $(this).data('value');
          //     //console.log(currentOption.value);
          //   }
          // });

          return currentOption;
        } else {
          currentOption.value = $element.val();
          currentOption.index = $element.data('index');

          return currentOption;
        }
      });

      // remove any unchecked input values if using radio buttons or checkboxes
      currentOptions = _.compact(currentOptions);

      return currentOptions;
    },

    /**
     * Find variant based on selected values.
     *
     * @param  {array} selectedValues - Values of variant inputs
     * @return {object || undefined} found - Variant object from product.variants
     */
    _getVariantFromOptions: function() {
      var selectedValues = this._getCurrentOptions();
      var variants = this.product.variants;

      var found = _.find(variants, function(variant) {
        return selectedValues.every(function(values) {
          return _.isEqual(variant[values.index], values.value);
        });
      });

      return found;
    },

    /**
     * Event handler for when a variant input changes.
     */
    _onSelectChange: function() {
      var variant = this._getVariantFromOptions();

      // this.$container.trigger({
      //   type: 'variantChange',
      //   variant: variant
      // });

      if (!variant) {
        return;
      }

      this._updateMasterSelect(variant);
      this._updateImages(variant);
      this._updatePrice(variant);
      this._updateSKU(variant);
      this.currentVariant = variant;

      if (this.enableHistoryState) {
        this._updateHistoryState(variant);
      }
    },

    /**
     * Trigger event when variant image changes
     *
     * @param  {object} variant - Currently selected variant
     * @return {event}  variantImageChange
     */
    _updateImages: function(variant) {
      var variantImage = variant.featured_image || {};
      var currentVariantImage = this.currentVariant.featured_image || {};

      if (!variant.featured_image || variantImage.src === currentVariantImage.src) {
        return;
      }

      this.$container.trigger({
        type: 'variantImageChange',
        variant: variant
      });
    },

    /**
     * Trigger event when variant price changes.
     *
     * @param  {object} variant - Currently selected variant
     * @return {event} variantPriceChange
     */
    _updatePrice: function(variant) {
      if (variant.price === this.currentVariant.price && variant.compare_at_price === this.currentVariant.compare_at_price) {
        return;
      }

      this.$container.trigger({
        type: 'variantPriceChange',
        variant: variant
      });
    },

    /**
     * Trigger event when variant sku changes.
     *
     * @param  {object} variant - Currently selected variant
     * @return {event} variantSKUChange
     */
    _updateSKU: function(variant) {
      if (variant.sku === this.currentVariant.sku) {
        return;
      }

      this.$container.trigger({
        type: 'variantSKUChange',
        variant: variant
      });
    },

    /**
     * Update history state for product deeplinking
     *
     * @param  {variant} variant - Currently selected variant
     * @return {k}         [description]
     */
    _updateHistoryState: function(variant) {
      if (!history.replaceState || !variant) {
        return;
      }

      var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
      window.history.replaceState({path: newurl}, '', newurl);

      $('.product-single__summary__info .description').removeClass('block').addClass('hidden');
      $('.product-single__summary__info .description#variant-'+ variant.id +'-details').removeClass('hidden').addClass('block');
    },

    /**
     * Update hidden master select of variant change
     *
     * @param  {variant} variant - Currently selected variant
     */
    _updateMasterSelect: function(variant) {
      $(this.originalSelectorId, this.$container).val(variant.id);

      // $('klarna-placement').removeClass( "block" ).addClass( "hidden" );
      // $('klarna-placement[data-variant-id='+ variant.id +']').removeClass( "hidden" ).addClass( "block" );
    }
  });

  return Variants;
})();

$(document).ready(function() {
  theme.MobileNav.init();

  var sections = new theme.Sections();

  sections.register('cart-template', theme.Cart);
  sections.register('product', theme.Product);
});

window.theme = window.theme || {};
theme.init = function() {
  // console.log('theme.init');

  theme.customerTemplates.init();

  theme.smoothScroll();

  // var selectors = {
  //   image: '[data-image]',
  //   imagePlaceholder: '[data-image-placeholder]',
  //   imageWithPlaceholderWrapper: '[data-image-with-placeholder-wrapper]',
  //   lazyloaded: '.lazyloaded'
  // };

  var classes = {
    hidden: 'hidden'
  };

  // $(document).on('lazyloaded', function(e) {
  //   var $target = $(e.target);
  //
  //   if ($target.data('bgset')) {
  //     var $image = $target.find(selectors.lazyloaded);
  //     if ($image.length) {
  //       var alt = $target.data('alt');
  //       var src = $image.data('src') ? $image.data('src') : $target.data('bg');
  //
  //       $image.attr('alt', alt ? alt : '');
  //       $image.attr('src', src ? src : '');
  //     }
  //   }
  //
  //   if (!$target.is(selectors.image)) {
  //     return;
  //   }
  //
  //   $target
  //     .closest(selectors.imageWithPlaceholderWrapper)
  //     .find(selectors.imagePlaceholder)
  //     .addClass(classes.hidden);
  // });

  // Hover Affect
  function addClassHover(){
    $('body').addClass('hover');
  }
  function removeClassHover(){
    $('body').removeClass('hover');
  }

  // Main menu hover
  let timer, $this;
  $(".has-megamenu").mouseenter(function(){
    $this = $(this);
    timer = setTimeout(function(){
      $this.addClass('active');
      addClassHover();
    },250)
  }).mouseleave(function(){
    $this.removeClass('active');
    removeClassHover();
    clearTimeout(timer);
  });

  // Header fixed on mobile
  let lastScrollTop = 0;
  $(window).scroll(function(event){
    if ($(window).width() < 569) {
      let st = $(this).scrollTop();
      if (st > lastScrollTop) {
        // downscroll code
        if (st > 26) {
          $('.site-header').addClass('fixed');
          $('body').addClass('header-fixed');
        }
      } else {
        // upscroll code
        if (st < 26) {
          $('.site-header').removeClass('fixed');
          $('body').removeClass('header-fixed');
        }
      }
      lastScrollTop = st;
    }

    if ($(window).width() > 1023) {
      let st = $(this).scrollTop();
      if (st > lastScrollTop) {
        // downscroll code
        if (st > 194) {
          $('.sitebar__nav').addClass('fixed');
        }
      } else {
        // upscroll code
        if (st < 194) {
          $('.sitebar__nav').removeClass('fixed');
        }
      }
      lastScrollTop = st;
    }

  });

  // Header
  $(window).scroll(function(event){
    let stMain = $(this).scrollTop();

    if (stMain > 0) {
      $('.site-header').addClass('fixed');
    }
    if (stMain < 28) {
      $('.site-header').removeClass('fixed');
    }
  });

  var changed = false;
  function changeQty() {
    // This button will increment the value
    $(document).on( 'click', '[data-quantity="plus"]', function(e){
      // Stop acting like a button
      e.preventDefault();
      var fieldName = $(this).attr('data-field');
      var maxVal = parseInt($('input#'+fieldName).attr("max"));
      if( isNaN(maxVal) ){ maxVal = 999; }
      // Get its current value
      var currentVal = parseInt($('input#'+fieldName).val());
      // If is not undefined
      if (!isNaN(currentVal)) {
        // Increment
        if(currentVal < maxVal){
          $('input#'+fieldName).val(currentVal + 1);
        }
      } else {
        // Otherwise put a 0 there
        $('input#'+fieldName).val(0);
      }
      $('input#'+fieldName).trigger('change');

      changed = true;
    });
    // This button will decrement the value till 0
    $(document).on( 'click', '[data-quantity="minus"]', function(e){
      // Stop acting like a button
      e.preventDefault();
      var fieldName = $(this).attr('data-field');
      var minVal = parseInt($('input#'+fieldName).attr("min"));
      if( minVal < 1 ){ minVal = 1; }
      // Get its current value
      var currentVal = parseInt($('input#'+fieldName).val());
      // If it isn't undefined or its greater than 0
      if (!isNaN(currentVal) && currentVal > minVal) {
        // Decrement one
        $('input#'+fieldName).val(currentVal - 1);
      } else {
        // Otherwise put a 0 there
        $('input#'+fieldName).val(minVal);
      }
      $('input#'+fieldName).trigger('change');

      changed = true;
    });
  }changeQty();

  // Search in popup
  $('.site-header__search-icon').magnificPopup({
    type: 'inline',
    closeBtnInside: true,
    mainClass: 'mfp-modal-search'
  });

  // Coupon copy
  let copyBtn = $('.site-header__bottom .coupon');
  copyBtn.on('click', copyText);

  function copyText(ev){

    let coupon = $('.site-header__bottom .coupon');
    let text = coupon.text();

    let $temp = $("<input>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
  }

  // Home page - slider
  let $slider_hp = $('.slideshow');
  let $slider_hp_mobile = $('.slideshow-mobile');
  let $skip_slides = $('.slideshow').data('skip');

  let slides = [];
  $.each($('.slideshow a'), function (key, value) {

    if(key > $skip_slides-1){
      slides.push(value.outerHTML);
    }
    $(this).remove();
  });

  function makeCustomSlide(){
    let slide = '';

    $.each(slides, function (key, value) {
      if($skip_slides === 0){
        if(key === 0) {
          slide += '<div class="double-slide">' + value;
        } else if(key === 1) {
          slide += value + '</div>';
        } else {
          if(key === 2){ $slider_hp.append( slide ); }
          $slider_hp.append( '<div>' + value + '</div>' );
        }
      } else {
        $slider_hp.append( '<div>' + value + '</div>' );
      }

      $slider_hp_mobile.append( '<div>' + value + '</div>' );
    });

    function sliderHp(){
      $slider_hp.not('.slick-initialized').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        dots: true,
        arrows: true,
        autoplay: true,
        autoplaySpeed: 4000,
        prevArrow: '<button type="button" class="slick-prev" aria-label="Previous"><span>Prev</span></button>',
        nextArrow: '<button type="button" class="slick-next" aria-label="Next"><span>Next</span></button>',
        responsive: [
          {
            breakpoint: 736,
            settings: {
              arrows: false
            }
          }
        ]
      });
      $slider_hp_mobile.not('.slick-initialized').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        dots: true,
        arrows: true,
        autoplay: true,
        autoplaySpeed: 4000,
        prevArrow: '<button type="button" class="slick-prev" aria-label="Previous"><span>Prev</span></button>',
        nextArrow: '<button type="button" class="slick-next" aria-label="Next"><span>Next</span></button>',
        responsive: [
          {
            breakpoint: 736,
            settings: {
              arrows: false
            }
          }
        ]
      });

      $slider_hp.addClass('hidden md:block');
    }

    //sliderHp();
  }
  makeCustomSlide();

  let $slider2_hp = $('.slideshow-2');
  function slider2Hp(){
    $slider2_hp.not('.slick-initialized').slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      infinite: false,
      dots: true,
      arrows: true,
      autoplay: false,
      autoplaySpeed: 4000,
      prevArrow: '<button type="button" class="slick-prev" aria-label="Previous"><span>Prev</span></button>',
      nextArrow: '<button type="button" class="slick-next" aria-label="Next"><span>Next</span></button>',
      responsive: [
        {
          breakpoint: 736,
          settings: {
            arrows: false
          }
        }
      ]
    });
  }slider2Hp();

  // Home page - brands
  let $slider_hp_brands = $('.brands-block .slider')
  function sliderHpBrands(){
    $slider_hp_brands.slick({
      rows: 2,
      slidesToShow: 5,
      slidesToScroll: 1,
      dots: false,
      arrows: false,
      prevArrow: '<button type="button" class="slick-prev" aria-label="Previous"><span>Prev</span></button>',
      nextArrow: '<button type="button" class="slick-next" aria-label="Next"><span>Next</span></button>',
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            rows: 2,
            slidesToShow: 3
          }
        },
        {
          breakpoint: 768,
          settings: {
            rows: 6,
            slidesToShow: 2
          }
        }
      ]
    });
  }sliderHpBrands();

  // Home page - products
  function sliderHpProducts(tab){
    let $slider_hp_products = $('.products-block ' + tab + ' .slider')
    $slider_hp_products.slick({
      slidesToShow: 3,
      slidesToScroll: 3,
      dots: false,
      arrows: true,
      centerMode: false,
      infinite: false,
      prevArrow: '<button type="button" class="slick-prev" aria-label="Previous"><span>Prev</span></button>',
      nextArrow: '<button type="button" class="slick-next" aria-label="Next"><span>Next</span></button>',
      responsive: [
        {
          breakpoint: 990,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 568,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true,
            arrows: false
          }
        }
      ]
    });
  }  sliderHpProducts('#tabs-1');

  function sliderHpProductsSection(tab){
    let $slider_hp_products = $('.products-block ' + tab + ' .slider')
    $slider_hp_products.slick({
      slidesToShow: 3,
      slidesToScroll: 3,
      dots: false,
      arrows: true,
      centerMode: false,
      infinite: false,
      prevArrow: '<button type="button" class="slick-prev" aria-label="Previous"><span>Prev</span></button>',
      nextArrow: '<button type="button" class="slick-next" aria-label="Next"><span>Next</span></button>',
      responsive: [
        {
          breakpoint: 990,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 568,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
            dots: true,
            arrows: false
          }
        }
      ]
    });
  }

  // Why are prices so low page - brands
  let $slider_wapsl_brands = $('.wapsl-block .slider')
  function sliderWapslBrands(){
    $slider_wapsl_brands.slick({
      slidesToShow: 6,
      slidesToScroll: 1,
      dots: false,
      arrows: false,
      prevArrow: '<button type="button" class="slick-prev" aria-label="Previous"><span>Prev</span></button>',
      nextArrow: '<button type="button" class="slick-next" aria-label="Next"><span>Next</span></button>',
      responsive: [
        {
          breakpoint: 1800,
          settings: {
            arrows: true,
            slidesToShow: 4
          }
        },
        {
          breakpoint: 1200,
          settings: {
            arrows: true,
            slidesToShow: 3
          }
        },
        {
          breakpoint: 768,
          settings: {
            arrows: true,
            slidesToShow: 2
          }
        }
      ]
    });
  }sliderWapslBrands();

  // -- START -- WISHLIST FUNCTIONALITY
  $(document).on('click','.addToWishList', function(){
    let $this = $(this);
    let productHandle = $this.data('product-handle');
    productHandle = productHandle.replaceAll('https://www.bhfo.com/products/','');
    productHandle = productHandle.replaceAll(productHandle.substr(productHandle.indexOf('?')),'');

    $.ajax({
      url: '/products/'+productHandle,
      dataType: 'json',
      async: false,
      success: function(result) {
        let product = result.product;
        let wishlistProductId = product.id;

        // Do not add wishlist functionality if there are no sizes
        if (product.tags && product.tags.length) {
          // Create wishlist product details to pass into add and remove events
          let wishlistProductDetails = {
            epi: product.variants[0].id,
            du: 'https://www.bhfo.com/products/' + product.handle, // Wishlist wants to force https
            empi: wishlistProductId,
            dt: product.name,
            iu: product.image.src,
            pr: product.variants[0].price
          };

          // If button is not active, add to wishlist
          window._swat.fetchWrtEventTypeET(function (res) {
            var wishlistInactive = res.filter(function (r) {
              return (r.empi * 1) == (wishlistProductId * 1);
            });
            if (wishlistInactive.length === 0) {
              window._swat.addToWishList(wishlistProductDetails, function () {
                product.wishlist = true;
                $this.addClass('swym-added');
              });
            } else {
              window._swat.removeFromWishList(wishlistProductDetails, function () {
                product.wishlist = false;
                $this.removeClass('swym-added');
              });
            }
          }, 4);
        } else {
          return false;
        }
      }
    });
  });

  // Check if product should have wishlist class and attributes
  function checkWishlist(product) {
    window._swat.fetchWrtEventTypeET(function(res) {
      if (res && res.length) {
        // Check if ids are in the wishlist selected items
        let inWishlist = res.filter(function(r) {
          return (r.empi * 1) == (product.id * 1);
        });
        if(inWishlist.length === 1){
          $('.product_'+inWishlist[0].empi).addClass('swym-added');
        }
      }
    });
  }

  // -- END -- WISHLIST FUNCTIONALITY

  $( "#products-block-tabs" ).tabs({
    beforeActivate: function( event, ui ) {
      let tabId = event.currentTarget.hash;

      if ($(tabId + ' li').length === 0) {
        $('#products-block-tabs').addClass('loading');
      }
    },
    activate: function( event, ui ) {
      setTimeout(function(){
        let tabId = event.currentTarget.hash;
        let tabNr = tabId.replace('#tabs-', '');

        if ($(tabId + ' li').length === 0) {

          let productsInTabs = JSON.parse(
            document.getElementById('products-tab').innerHTML
          );

          $.each(productsInTabs.products, function (key, value) {
            if (value.type === 'product_' + tabNr) {
              $.ajax({
                url: '/products/'+value.product,
                dataType: 'json',
                async: false
              })
              .done(function( data ) {
                if(data.product){
                  let product = data.product;

                  checkWishlist(product);

                  let compare_at_price = '$' + product.variants[0].compare_at_price;
                  let price = '$' + product.variants[0].price;

                  let discount = parseFloat(100 - (product.variants[0].price / (product.variants[0].compare_at_price / 100)));
                  let discountText = '';
                  if(discount > 4){
                    discountText = '<span class="discount">' + Math.round(discount) + '% off</span>' +
                    '<span class="discount-label">' + Math.round(discount) + '% off</span>';
                  }

                  let img = product.image.src;

                  img = img.replace('.jpg', '_340x340.jpg');
                  img = img.replace('.png', '_340x340.png');

                  let imgs = product.images;
                  let imgs_content = '';
                  if(imgs) {
                    let i = 0;
                    for (let image of imgs) {
                      if (i > 0) {
                        let imageURL = image.src;
                        imageURL = imageURL.replace('.jpg', '_110x110.jpg');
                        imageURL = imageURL.replace('.png', '_110x110.png');
                        imgs_content += '<span><img src="' + imageURL + '"></span>';
                      }
                      if (i === 3) { break; }
                      i = i + 1;
                    }
                  }

                  let productElement = '' +
                    '<li>' +
                    '<div class="grid-view-item product-card">' +
                    '<div class="grid-view-item__link-block">' +
                    '<a class="grid-view-item__link" href="/products/' + product.handle + '" tabindex="0">' +
                    '<span class="hidden">' + product.title + '</span>' +
                    '</a>' +
                    '<div class="product-card__image-with-placeholder-wrapper" data-image-with-placeholder-wrapper="">' +
                    '<div class="grid-view-item__image-wrapper product-card__image-wrapper">' +
                    '<span><a href="/products/' + product.handle + '"><img src="' + img + '" class="grid-view-item__image lazyautosizes ls-is-cached lazyloaded" alt="' + product.title + '" data-src="' + img + '" data-widths="[180, 360, 540, 720, 900, 1080, 1296, 1512, 1728, 2048]" data-aspectratio="1.0" data-sizes="auto" data-image="" sizes="264px"></a></span>' +
                    '<div class="product-card__image-wrapper__min">' +
                    imgs_content +
                    '</div>' +
                    '</div>' +
                    '<div class="placeholder-background placeholder-background--animation" data-image-placeholder=""></div>' +
                    '</div>' +
                    '<noscript>' +
                    '<img class="grid-view-item__image" src="//cdn.shopify.com/s/files/1/0469/2737/products/9aw3qjw8EzqoIxvqpDDvUt8l9Jz8Ml5D-25_e46331f7-92cb-4c7e-bfc5-235c571ad287_263x263@2x.jpg?v=1593207770" alt="' + product.title + '" style="max-width: 263.0px;">' +
                    '</noscript>' +
                    '<span class="vendor"><a href="/collections/vendors?q=' + product.vendor + '" title="' + product.vendor + '" tabindex="0">' + product.vendor + '</a></span>' +
                    '<span class="title">' + product.title.replace(product.vendor,"").replace("Womens","").replace("Women's","").replace("Women`s","").replace("Women’s","").replace("Mens","").replace("Men's","").replace("Kids","") + '</span>' +
                    '<span class="price">' + compare_at_price + '</span>' +
                    '<span class="price-with-discount">' + price + '</span>' +
                    discountText +
                    '<button class="swym-add-to-wishlist-view-product swym-button swym-iconbtnlink swym-heart swym-loaded product_' + product.id + ' addToWishList" data-product-handle="' + product.handle + '" data-product-id="' + product.id + '" aria-label="Add to Wishlist" intellisuggest=""></button>' +
                    '</div>' +
                    '</div>' +
                    '</li>';
                  $(tabId + ' .products').append(productElement);
                }
              });
            }
          });
          sliderHpProducts(tabId);
          $('#products-block-tabs').removeClass('loading');
        }
      }, 500);
    }
  });

  function getProductsForCarouselBlock(idBlock) {
    let sectionID = idBlock.replace('products-','');

    let productsInTabs = JSON.parse(
      document.getElementById(idBlock).innerHTML
    );

    $('#shopify-section-' + sectionID + ' .products').html('');

    $.each(productsInTabs.products, function (key, value) {
      $.ajax({
        url: '/products/'+value.product,
        dataType: 'json',
        async: false,
        success: function(data, textStatus, jqXHR){
          if(data.product){
            let product = data.product;

            checkWishlist(product);

            let compare_at_price = '$' + product.variants[0].compare_at_price;
            let price = '$' + product.variants[0].price;

            let discount = parseFloat(100 - (product.variants[0].price / (product.variants[0].compare_at_price / 100)));
            let discountText = '';
            if(discount > 4) {
              discountText = '<span class="discount">' + Math.round(discount) + '% off</span>' +
                '<span class="discount-label">' + Math.round(discount) + '% off</span>';
            }
            let img = product.image.src;
            img = img.replace('.jpg', '_317x317.jpg');
            img = img.replace('.png', '_317x317.png');
            let productElement = '' +
              '<li>' +
              '<div class="grid-view-item product-card">' +
              '<div class="grid-view-item__link-block">' +
              '<a class="grid-view-item__link" href="/products/' + product.handle + '" tabindex="0">' +
              '<span class="hidden">' + product.title + '</span>' +
              '</a>' +
              '<div class="product-card__image-with-placeholder-wrapper" data-image-with-placeholder-wrapper="">' +
              '<div class="grid-view-item__image-wrapper product-card__image-wrapper">' +
              '<span><a href="/products/' + product.handle + '"><img src="' + img + '" class="grid-view-item__image lazyautosizes ls-is-cached lazyloaded" alt="' + product.title + '" data-src="' + img + '" data-widths="[180, 360, 540, 720, 900, 1080, 1296, 1512, 1728, 2048]" data-aspectratio="1.0" data-sizes="auto" data-image="" sizes="264px"></a></span>' +
              '</div>' +
              '<div class="placeholder-background placeholder-background--animation" data-image-placeholder=""></div>' +
              '</div>' +
              '<noscript>' +
              '<img class="grid-view-item__image" src="//cdn.shopify.com/s/files/1/0469/2737/products/9aw3qjw8EzqoIxvqpDDvUt8l9Jz8Ml5D-25_e46331f7-92cb-4c7e-bfc5-235c571ad287_263x263@2x.jpg?v=1593207770" alt="' + product.title + '" style="max-width: 263.0px;">' +
              '</noscript>' +
              '<span class="vendor"><a href="/collections/vendors?q=' + product.vendor + '" title="' + product.vendor + '" tabindex="0">' + product.vendor + '</a></span>' +
              '<span class="title">' + product.title + '</span>' +
              '<span class="price">' + compare_at_price + '</span>' +
              '<span class="price-with-discount">' + price + '</span>' +
              discountText +
              '<button class="swym-add-to-wishlist-view-product swym-button swym-iconbtnlink swym-heart swym-loaded product_' + product.id + ' addToWishList" data-product-handle="' + product.handle + '" data-product-id="' + product.id + '" aria-label="Add to Wishlist" intellisuggest=""></button>' +
              '</div>' +
              '</div>' +
              '</li>';
            $('#shopify-section-' + sectionID + ' .products').append(productElement);
          }
        }
      });

    });
    sliderHpProductsSection('#section-products-'+ sectionID);
  }
  if($('#products-1602849018489').length > 0) {
    setTimeout(function(){ getProductsForCarouselBlock('products-1602849018489'); }, 4000 )
  }
  // if($('#products-1602849107093').length > 0) {
  //   setTimeout(function(){ getProductsForCarouselBlock('products-1602849107093'); }, 6000 )
  // }
  if($('#products-products-block').length > 0) {
    setTimeout(function(){ getProductsForCarouselBlock('products-products-block'); }, 4000 )
  }

  // Home page - products - tabs menu
  let $slider_hp_tabsmenu = $('#tabs-menu')
  function sliderHpTabsmenu(){
    if ($(window).width() <= 680) {
      $slider_hp_tabsmenu.slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        initialSlide: 1,
        dots: false,
        arrows: false,
        centerMode: true,
        responsive: [
          {
            breakpoint: 568,
            settings: {
              slidesToShow: 2
            }
          }
        ]
      });
    }else{
      if($slider_hp_tabsmenu.hasClass("slick-initialized") === true){
        $slider_hp_tabsmenu.slick('unslick');
      }
    }
  }sliderHpTabsmenu();

  // Home page - fashion
  /*let $slider_hp_fashion = $('.fashion-block .slider')
  function sliderHpFashion(){
    if ($(window).width() <= 990) {
      $slider_hp_fashion.not('.slick-initialized').slick({
        slidesToShow: 2,
        slidesToScroll: 1,
        initialSlide: 1,
        dots: false,
        arrows: true,
        centerMode: true,
        prevArrow: '<button type="button" class="slick-prev" aria-label="Previous"><span>Prev</span></button>',
        nextArrow: '<button type="button" class="slick-next" aria-label="Next"><span>Next</span></button>',
        responsive: [
          {
            breakpoint: 568,
            settings: {
              slidesToShow: 1
            }
          }
        ]
      });
    }else{
      if($slider_hp_fashion.hasClass("slick-initialized") === true){
        $slider_hp_fashion.slick('unslick');
      }
    }
  }sliderHpFashion();*/

  // Nosto slider
  // function sliderNosto(){
  //   $('.nosto_element .nosto-list').slick({
  //     slidesToShow: 5,
  //     slidesToScroll: 5,
  //     dots: false,
  //     arrows: true,
  //     centerMode: false,
  //     infinite: false,
  //     prevArrow: '<button type="button" class="slick-prev" aria-label="Previous"><span>Prev</span></button>',
  //     nextArrow: '<button type="button" class="slick-next" aria-label="Next"><span>Next</span></button>',
  //     responsive: [
  //       {
  //         breakpoint: 1200,
  //         settings: {
  //           slidesToShow: 4,
  //           slidesToScroll: 4
  //         }
  //       },
  //       {
  //         breakpoint: 568,
  //         settings: {
  //           slidesToShow: 2,
  //           slidesToScroll: 2
  //         }
  //       }
  //     ]
  //   });
  // }

  function getProductIdAttrForWishlist(value) {
    let str = value.outerHTML;

    let s = str.search('data-product-id="');
    let f = str.search(' aria-label="');

    let productId = str.substring(s, f);
    productId = productId.replace('data-product-id="', '');
    productId = productId.replace('"', '');

    let product = [];
    if(productId !== ''){
      product.id = parseInt(productId);
      checkWishlist(product);
    }
  }

  // let nostoInterval = setInterval(function() {
  //   // console.log('nostoInterval - '+ $('.nosto_element .nosto-list').length);
  //   if($('.nosto_element .nosto-list').length > 0){
  //
  //     clearInterval(nostoInterval);
  //
  //     $.each($('.nosto_element .nosto-list li'), function (key, value) {
  //       getProductIdAttrForWishlist(value);
  //     });
  //
  //     // console.log('nostoInterval - done');
  //
  //     sliderNosto();
  //   }
  // }, 500);



  // PDP - products
  function sliderPdpPosts(){
    let $slider_pdp_posts = $(document).find('.product-recommendations .slider')
    $slider_pdp_posts.slick({
      slidesToShow: 5,
      slidesToScroll: 5,
      dots: false,
      arrows: true,
      centerMode: false,
      infinite: false,
      prevArrow: '<button type="button" class="slick-prev" aria-label="Previous"><span>Prev</span></button>',
      nextArrow: '<button type="button" class="slick-next" aria-label="Next"><span>Next</span></button>',
      responsive: [
        {
          breakpoint: 1360,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 4
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        }
      ]
    });
  }

  let $containerRecommendations = $('#product-you-might-also-like');
  function ProductRecommendations($container) {
    let baseUrl = $container.attr('data-base-url');
    let productId = $container.attr('data-product-id');
    let limit = $container.attr('data-limit');
    let productRecommendationsUrlAndContainerClass = baseUrl + '?section_id=product-you-might-also-like&limit=' + limit +
      '&product_id=' + productId +
      ' #product-you-might-also-like';
    $container.parent().load(productRecommendationsUrlAndContainerClass, function( response, status, xhr ) {
      sliderPdpPosts();
    });
  }
  if($containerRecommendations.length > 0) {
    ProductRecommendations($containerRecommendations);
    setTimeout(function(){
      $.each($('#product-you-might-also-like li'), function (key, value) {
        getProductIdAttrForWishlist(value);
      });
    }, 1000 )
  }

  // PDP - popup
  $('.product-form__size-chart__link').magnificPopup({
    // delegate: 'a',
    type: 'image',
    closeBtnInside: true,
    mainClass: 'mfp-height-auto'
  });

  // PDP - size chart popup
  $('.product-form__size-chart__popup').magnificPopup({
    type: 'inline',
    closeBtnInside: true,
    callbacks: {
      open: function() {
        $('.popup-sizechart__lside__image').html($('.product-single__media a').html());

        $('.popup-sizechart ul li').removeClass('current');
        $('.popup-sizechart ul li[data-value="'+ $('.product-form__option .active').data('value-schart') +'"]').addClass('current');

        $('.product-form__option li').each(function() {
          $('.popup-sizechart ul li[data-value="' + $(this).data('value-schart') + '"]').addClass('active');
          if($(this).hasClass('disable')){
            $('.popup-sizechart ul li[data-value="' + $(this).data('value-schart') + '"]').removeClass('active');
          }
        });

        let slickGoTo = $('.popup-sizechart ul li.current').index();
        sliderSizeChart(slickGoTo);
      },
      close: function() {
        if($(document).find('.popup-sizechart__rside ul').hasClass("slick-initialized") === true){
          $(document).find('.popup-sizechart__rside ul').slick('unslick');
        }
      }
    }
  });
  function sliderSizeChart(slickGoTo){
    let $sliderSizeChart = $(document).find('.popup-sizechart__rside ul')
    $sliderSizeChart.slick({
      slidesToShow: 4,
      slidesToScroll: 2,
      dots: false,
      arrows: true,
      centerMode: false,
      infinite: false,
      prevArrow: '<button type="button" class="slick-prev" aria-label="Previous"><span>Prev</span></button>',
      nextArrow: '<button type="button" class="slick-next" aria-label="Next"><span>Next</span></button>',
      responsive: [
        {
          breakpoint: 1366,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 1280,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    });

    $sliderSizeChart.slick('slickGoTo', slickGoTo);
  }

  $(document).on('click', '.popup-sizechart ul li.active', function(e){
    e.preventDefault();

    $('.popup-sizechart ul li').removeClass('current');
    $(this).addClass('current');
    $('.Size .product-form__option li[data-value-schart="'+ $(this).data('value') +'"]').trigger('click');
  });

  // Cart page - products
  let $containerCartRecommendations = $('#cart-product-recomendation');
  if($containerCartRecommendations.length > 0) { sliderPdpPosts(); }

  // PLP Category
  function CollectionAccordion(){
    $( ".collection-sidebar__block" ).accordion({collapsible : true, active : false, header: "h3", heightStyle: "content"});
  }CollectionAccordion();

  $('.collection-sidebar__block__show-more').click(function(e){
    e.preventDefault();

    var clicks = $(this).data('clicks');
    if (clicks) {
      $('.brands-hidden').removeClass('show');
      $(this).text('View More');
    } else {
      $('.brands-hidden').addClass('show');
      $(this).text('View Less');
    }
    $(this).data("clicks", !clicks);
  });

  $('.filters-toolbar__button').click(function(e){
    e.preventDefault();

    $('.collection-sidebar').css('height', $(document).height()).addClass('active');
  });
  $('.collection-sidebar__close').click(function(e){
    e.preventDefault();

    $('.collection-sidebar').removeClass('active');
  });

  let $slider_plp_category = $('#shop-by-category__banners')
  function sliderPlpCategory(){
    if ($(window).width() < 1025) {
      $slider_plp_category.not('.slick-initialized').slick({
        slidesToShow: 5,
        slidesToScroll: 1,
        initialSlide: 1,
        dots: false,
        arrows: true,
        centerMode: true,
        prevArrow: '<button type="button" class="slick-prev" aria-label="Previous"><span>Prev</span></button>',
        nextArrow: '<button type="button" class="slick-next" aria-label="Next"><span>Next</span></button>',
        responsive: [
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 3
            }
          },
          {
            breakpoint: 568,
            settings: {
              slidesToShow: 2
            }
          },
          {
            breakpoint: 414,
            settings: {
              slidesToShow: 1
            }
          }
        ]
      });
    }else{
      if($slider_plp_category.hasClass("slick-initialized") === true){
        $slider_plp_category.slick('unslick');
      }
    }
  }sliderPlpCategory();

  // About
  $('.video-block__play').magnificPopup({
    type: 'inline',
    closeBtnInside: true,
    mainClass: 'mfp-modal'
  });

  // Page sidebar menu
  // let $slider_sidebar_menu = $('.sitebar__nav ul')
  // function sliderSidebarMenu(){
  //   if ($(window).width() <= 1023) {
  //     $slider_sidebar_menu.slick({
  //       slidesToShow: 5,
  //       slidesToScroll: 1,
  //       centerMode: true,
  //       variableWidth: true,
  //       dots: true,
  //       arrows: false,
  //       responsive: [
  //         {
  //           breakpoint: 680,
  //           settings: {
  //             slidesToShow: 4
  //           }
  //         },
  //         {
  //           breakpoint: 414,
  //           settings: {
  //             slidesToShow: 2
  //           }
  //         }
  //       ]
  //     });
  //   }else{
  //     if($slider_sidebar_menu.hasClass("slick-initialized") === true){
  //       $slider_sidebar_menu.slick('unslick');
  //     }
  //   }
  // }sliderSidebarMenu();

  // Page brands menu
  let $slider_brands_menu = $('.brand-nav')
  function sliderBrandsMenu(){
    if ($(window).width() <= 768) {
      $slider_brands_menu.slick({
        slidesToShow: 6,
        slidesToScroll: 6,
        centerMode: false,
        dots: true,
        arrows: false,
        responsive: [
          {
            breakpoint: 680,
            settings: {
              slidesToShow: 4,
              slidesToScroll: 4
            }
          },
          {
            breakpoint: 414,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2
            }
          }
        ]
      });
    }else{
      if($slider_brands_menu.hasClass("slick-initialized") === true){
        $slider_brands_menu.slick('unslick');
      }
    }
  }sliderBrandsMenu();

  // Account - register
  $('body').on('click', '#RegisterForm .btn, .site-footer__info__newsletter #ContactFooter .btn', function() {
    let parent = $(this).parent().parent().parent();
    if (parent.find('.agree').is(':checked')) {
      parent.find('input[type=submit]').submit();
    } else {
      parent.find('#agree-error').removeClass('hidden');
      return false;
    }
  });

  // PLP Category
  function rewardsFaq(){
    $( ".rewards-faq" ).accordion({collapsible : true, active : false, header: "h3", heightStyle: "content"});
  }rewardsFaq();

  // PDP Reviews
  let myReviewCount = setInterval(reviewCount, 1000);

  function reviewCount() {
    let reviewCountEl = $('.okeReviews-reviews-controls-reviewCount');
    if(reviewCountEl.length > 0) {
      let reviewCount = reviewCountEl.text();
      $('.page-content h1 span').text(reviewCount.replace('Reviews','reviews of bhfo.com'));

      clearInterval(myReviewCount);
    }
  }

  // Returns
  // $('#returns-exchanges-info__element-1 a').magnificPopup({
  //   type: 'inline',
  //   closeBtnInside: true,
  //   mainClass: 'mfp-modal'
  // });

  function showPopupWithError(returnSubmitButton){
    $.magnificPopup.close();
    $.magnificPopup.open({
      items: {
        src: '#returns-error'
      },
      type: 'inline'
    });

    returnSubmitButton.innerText = 'submit';
    returnSubmitButton.disabled = false;
  }

  let form = document.getElementById('returns-popup__form')
  form.addEventListener('submit', function(e){
    e.preventDefault()

    let orderID = document.getElementById('orderID').value.replace('#','');
    let returnSubmitButton = document.getElementById('returns-popup__form__submit');
    returnSubmitButton.innerText = 'processing...';
    returnSubmitButton.disabled = true;

    try {
      fetch('https://bhfo-returnly-signifyd.netlify.app/.netlify/functions/api', {
        method: 'POST',
        cache: 'no-cache',
        body: JSON.stringify({orderID:orderID}),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
        .then(function(response){
          return response.json()
        })
        .then(function(data){ console.log(data);
          if(Object.keys(data.error).length === 0){
            if(data.signifyd.length !== 0 && typeof data.signifyd.decision !== 'undefined') {
              if(data.signifyd.decision.checkpointAction === 'ACCEPT') {
                window.location.href = 'https://returns.bhfo.com/?orderID='+orderID+'&zip='+data.shopify.address.zip;
              } else {
                $('#returns-error').html('<p>Your return has not been accepted, therefore it will not be processed.<br>' +
                  'Please contact <a href="mailto:customercare@bhfo.com">customercare@bhfo.com</a> for further information.</p>');
                showPopupWithError(returnSubmitButton);
              }
            } else {
              $('#returns-error').html('<p>Order not found.</p>');
              showPopupWithError(returnSubmitButton);
            }
          } else {
            $('#returns-error').html('<p>'+data.error.shopify+'</p>');
            showPopupWithError(returnSubmitButton);
          }

        }).catch(error => console.error('Error:', error));
    } catch (error) {
      console.error(error)
      $('#returns-error').html('<p>Order not found.</p>');
      showPopupWithError(returnSubmitButton);
    }
  });


  // Footer
  function FooterAccordion(){
    if ($(window).width() < 1024) {
      $( ".site-footer" ).accordion({collapsible : true, active : false, header: ".accordion-title", heightStyle: "content"});
    }else{
      if(typeof $(".site-footer").data("ui-accordion") != "undefined"){
        $( ".site-footer" ).accordion("destroy");
      }
    }
  } FooterAccordion();

  // Resize
  var resizeId2,resizeId3,resizeId4,resizeId5,resizeId6,resizeId7,resizeId8,resizeId9;
  $( window ).resize(function() {
    // clearTimeout(resizeId2);
    clearTimeout(resizeId3);
    // clearTimeout(resizeId4);
    clearTimeout(resizeId5);
    clearTimeout(resizeId6);
    clearTimeout(resizeId7);
    clearTimeout(resizeId8);
    clearTimeout(resizeId9);
    // resizeId2 = setTimeout(sliderHpFashion,500);
    resizeId3 = setTimeout(sliderHpTabsmenu,500);
    // resizeId4 = setTimeout(sliderHpFashion,500);
    // resizeId5 = setTimeout(sliderSidebarMenu,500);
    if($containerCartRecommendations.length > 0) { resizeId6 = setTimeout(sliderPdpPosts,500); }
    resizeId7 = setTimeout(sliderBrandsMenu,500);
    resizeId8 = setTimeout(sliderPlpCategory,500);
    resizeId9 = setTimeout(function(){$('label[for=SingleOptionSelector-0]').parent().find('.active').trigger('click')},500);

    FooterAccordion();
    CollectionAccordion();
  });
};

$(theme.init);

