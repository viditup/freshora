import React from 'react';

import {
  FlatList,
  useWindowDimensions,
} from 'react-native';

import {
  useNavigation,
} from '@react-navigation/native';

import ProductCard, {
  useGridWidth,
} from './ProductCard';

import {
  useCart,
} from '../context/CartContext';

import {
  C,
} from '../theme';


/*
 * ============================================================
 * PRODUCT GRID
 * ============================================================
 *
 * Normal:
 * 2 columns
 *
 * Compact:
 * 4 columns
 *
 * Compact is used by Products.js to reproduce
 * the small product cards from the reference design.
 */

export default function ProductGrid({
  data,

  onEnd,

  refreshing,

  onRefresh,

  ListHeaderComponent,

  ListEmptyComponent,

  ListFooterComponent,

  list = false,

  compact = false,
}) {
  const nav =
    useNavigation();


  const {
    cart,
    add,
    updateQuantity,
    removeFromCart,
  } = useCart();


  const {
    width,
  } = useWindowDimensions();


  /*
   * ----------------------------------------------------------
   * CARD WIDTHS
   * ----------------------------------------------------------
   */

  const normalWidth =
    useGridWidth();


  /*
   * 4 columns:
   *
   * 8 left
   * 8 right
   * 5 + 5 + 5 gaps
   */
  const compactWidth =
    (
      width -
      16 -
      15
    ) / 4;


  /*
   * ----------------------------------------------------------
   * CART QUANTITY
   * ----------------------------------------------------------
   */

  const qtyOf =
    (id) =>
      cart.items.find(
        (i) =>
          i.product_id ===
          id
      )?.quantity || 0;


  const inc =
    (p) => {
      const q =
        qtyOf(
          p.id
        );

      return q
        ? updateQuantity(
            p.id,
            q + 1
          )
        : add(
            p.id,
            1
          );
    };


  const dec =
    (p) => {
      const q =
        qtyOf(
          p.id
        );

      return q <= 1
        ? removeFromCart(
            p.id
          )
        : updateQuantity(
            p.id,
            q - 1
          );
    };


  /*
   * ----------------------------------------------------------
   * GRID
   * ----------------------------------------------------------
   */

  return (
    <FlatList
      /*
       * Different key forces FlatList to correctly
       * recalculate the column count.
       */
      key={
        list
          ? 'products-list'
          : compact
          ? 'products-4-grid'
          : 'products-2-grid'
      }


      data={
        data
      }


      numColumns={
        list
          ? 1
          : compact
          ? 4
          : 2
      }


      keyExtractor={
        (p) =>
          String(
            p.id
          )
      }


      /*
       * ------------------------------------------------------
       * GREENISH PAGE BACKGROUND
       * ------------------------------------------------------
       *
       * This is the important part:
       * NO GREY BACKGROUND.
       */
      style={{
        backgroundColor:
          C.bg,
      }}


      contentContainerStyle={{
        paddingBottom: 24,

        /*
         * Preserve greenish background
         * even below the last item.
         */
        backgroundColor:
          C.bg,
      }}


      showsVerticalScrollIndicator={
        false
      }


      /*
       * ------------------------------------------------------
       * COLUMN SPACING
       * ------------------------------------------------------
       */

      columnWrapperStyle={
        list
          ? undefined
          : {
              paddingHorizontal:
                compact
                  ? 8
                  : 16,

              /*
               * 5px gap between compact cards.
               */
              columnGap:
                compact
                  ? 5
                  : 0,

              justifyContent:
                compact
                  ? 'flex-start'
                  : 'space-between',
            }
      }


      /*
       * ------------------------------------------------------
       * CARD
       * ------------------------------------------------------
       */

      renderItem={
        ({
          item,
        }) => (
          <ProductCard
            product={
              item
            }

            row={
              list
            }

            compact={
              compact &&
              !list
            }

            style={
              list
                ? {
                    marginHorizontal:
                      16,

                    marginBottom:
                      10,
                  }
                : compact
                ? {
                    width:
                      compactWidth,

                    marginBottom:
                      8,
                  }
                : {
                    width:
                      normalWidth,

                    marginBottom:
                      12,
                  }
            }


            qty={
              qtyOf(
                item.id
              )
            }


            onPress={() =>
              nav.navigate(
                'ProductDetails',
                {
                  id:
                    item.id,
                }
              )
            }


            onAdd={() =>
              add(
                item.id,
                1
              )
            }


            onInc={
              inc
            }


            onDec={
              dec
            }
          />
        )
      }


      /*
       * ------------------------------------------------------
       * PAGINATION
       * ------------------------------------------------------
       */

      onEndReached={
        onEnd
      }

      onEndReachedThreshold={
        0.4
      }


      /*
       * ------------------------------------------------------
       * REFRESH
       * ------------------------------------------------------
       */

      refreshing={
        !!refreshing
      }

      onRefresh={
        onRefresh
      }


      /*
       * ------------------------------------------------------
       * HEADER / EMPTY / FOOTER
       * ------------------------------------------------------
       */

      ListHeaderComponent={
        ListHeaderComponent
      }

      ListEmptyComponent={
        ListEmptyComponent
      }

      ListFooterComponent={
        ListFooterComponent
      }


      keyboardShouldPersistTaps="handled"


      removeClippedSubviews={
        false
      }
    />
  );
}