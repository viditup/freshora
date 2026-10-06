import React, {
  memo,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import Img from './Img';

import {
  C,
  R,
  rs,
  FONT,
} from '../theme';


/*
 * ============================================================
 * NORMAL 2-COLUMN WIDTH
 * ============================================================
 */

export const useGridWidth =
  () =>
    (
      useWindowDimensions()
        .width -
      32 -
      12
    ) / 2;


/*
 * ============================================================
 * PRODUCT CARD
 * ============================================================
 */

function ProductCard({
  product: p,

  onPress,

  onAdd,

  qty = 0,

  onInc,

  onDec,

  style,

  wishlisted = false,

  onWishlist,

  details,

  row = false,

  compact = false,
}) {
  const out =
    p.stock <= 0;


  const [
    busy,
    setBusy,
  ] = useState(false);


  const alive =
    useRef(true);


  useEffect(
    () => {
      return () => {
        alive.current =
          false;
      };
    },
    []
  );


  const run =
    async (
      fn
    ) => {
      if (
        busy ||
        out
      ) {
        return;
      }


      setBusy(
        true
      );


      try {
        await fn();
      } finally {
        if (
          alive.current
        ) {
          setBusy(
            false
          );
        }
      }
    };


  const inc =
    () =>
      run(
        () =>
          onInc(p)
      );


  const dec =
    () =>
      run(
        () =>
          onDec(p)
      );


  /*
   * ==========================================================
   * COMPACT CARD
   * ==========================================================
   */

  if (
    compact &&
    !row
  ) {
    return (
      <View
        style={[
          styles.compactCard,
          style,
        ]}
      >

        {/* -----------------------------------------------
            PRODUCT IMAGE
           ----------------------------------------------- */}

        <TouchableOpacity
          activeOpacity={
            0.9
          }
          onPress={() =>
            onPress(p)
          }
          style={
            styles.compactPress
          }
        >

          <View
            style={
              styles.compactImageWrap
            }
          >

            <Img
              fit="contain"
              uri={
                p.images?.[0]
              }

              style={
                styles.compactImage
              }
            />


            {/* Discount */}
            {p.discount >
              0 && (
              <View
                style={
                  styles.compactBadge
                }
              >
                <Text
                  style={
                    styles.compactBadgeText
                  }
                >
                  {p.discount}%
                  {' '}
                  OFF
                </Text>
              </View>
            )}
          </View>


          {/* ---------------------------------------------
              NAME
             --------------------------------------------- */}

          <Text
            numberOfLines={
              2
            }
            style={
              styles.compactName
            }
          >
            {p.name}
          </Text>


          {/* ---------------------------------------------
              UNIT
             --------------------------------------------- */}

          <Text
            numberOfLines={
              1
            }
            style={
              styles.compactUnit
            }
          >
            {details ||
              p.unit}
          </Text>


          {/* ---------------------------------------------
              PRICE
             --------------------------------------------- */}

          <View
            style={
              styles.compactPriceRow
            }
          >
            <Text
              numberOfLines={
                1
              }
              style={
                styles.compactPrice
              }
            >
              {rs(
                p.price
              )}
            </Text>


            {p.original_price >
              p.price && (
              <Text
                numberOfLines={
                  1
                }
                style={
                  styles.compactStrike
                }
              >
                {rs(
                  p.original_price
                )}
              </Text>
            )}
          </View>
        </TouchableOpacity>


        {/* -----------------------------------------------
            ACTION
           ----------------------------------------------- */}

        {out ? (
          <View
            style={
              styles.compactSold
            }
          >
            <Text
              style={
                styles.compactSoldText
              }
            >
              Sold
            </Text>
          </View>
        ) : qty >
          0 ? (
          <View
            style={
              styles.compactStepper
            }
          >
            <TouchableOpacity
              onPress={
                dec
              }
              disabled={
                busy
              }
              style={
                styles.compactStep
              }
            >
              <Ionicons
                name="remove"
                size={10}
                color="#fff"
              />
            </TouchableOpacity>


            <Text
              style={
                styles.compactQty
              }
            >
              {busy
                ? '·'
                : qty}
            </Text>


            <TouchableOpacity
              onPress={
                inc
              }
              disabled={
                busy
              }
              style={
                styles.compactStep
              }
            >
              <Ionicons
                name="add"
                size={10}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() =>
              run(
                () =>
                  onAdd(p)
              )
            }
            disabled={
              busy
            }
            activeOpacity={
              0.85
            }
            style={
              styles.compactAdd
            }
          >
            {busy ? (
              <ActivityIndicator
                size="small"
                color="#fff"
              />
            ) : (
              <>
                <Ionicons
                  name="cart-outline"
                  size={9}
                  color="#fff"
                />

                <Text
                  style={
                    styles.compactAddText
                  }
                >
                  Add
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }


  /*
   * ==========================================================
   * NORMAL CARD
   * ==========================================================
   */

  const action =
    out ? (
      <View
        style={[
          styles.addBtn,
          {
            backgroundColor:
              '#F1F3F0',
          },
        ]}
      >
        <Text
          style={[
            styles.addBtnT,
            {
              color:
                C.muted,
            },
          ]}
        >
          Sold out
        </Text>
      </View>
    ) : qty >
      0 ? (
      <View
        style={[
          styles.addBtn,
          {
            justifyContent:
              'space-between',

            paddingHorizontal:
              4,
          },
        ]}
      >
        <TouchableOpacity
          onPress={
            dec
          }
          disabled={
            busy
          }
          style={
            styles.stepBtn
          }
        >
          <Ionicons
            name="remove"
            size={17}
            color="#fff"
          />
        </TouchableOpacity>


        <Text
          style={
            styles.qty
          }
        >
          {busy
            ? '·'
            : qty}
        </Text>


        <TouchableOpacity
          onPress={
            inc
          }
          disabled={
            busy
          }
          style={
            styles.stepBtn
          }
        >
          <Ionicons
            name="add"
            size={17}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    ) : (
      <TouchableOpacity
        onPress={() =>
          run(
            () =>
              onAdd(p)
          )
        }
        disabled={
          busy
        }
        activeOpacity={
          0.85
        }
        style={
          styles.addBtn
        }
      >
        {busy ? (
          <ActivityIndicator
            size="small"
            color="#fff"
          />
        ) : (
          <>
            <Ionicons
              name="cart-outline"
              size={15}
              color="#fff"
            />

            <Text
              style={
                styles.addBtnT
              }
            >
              Add
            </Text>
          </>
        )}
      </TouchableOpacity>
    );


  const photo =
    (
      <View
        style={
          row
            ? {
                width: 96,
              }
            : undefined
        }
      >

        <Img
          fit="contain"
          uri={
            p.images?.[0]
          }

          style={
            row
              ? {
                  width: 96,
                  height: 96,
                  borderRadius: 10,
                }
              : styles.img
          }
        />


        {p.discount >
          0 && (
          <View
            style={
              styles.badge
            }
          >
            <Text
              style={
                styles.badgeT
              }
            >
              {p.discount}%
              {' '}
              OFF
            </Text>
          </View>
        )}


        {!!onWishlist && (
          <TouchableOpacity
            onPress={
              onWishlist
            }
            style={
              styles.heart
            }
          >
            <Ionicons
              name={
                wishlisted
                  ? 'heart'
                  : 'heart-outline'
              }
              size={16}
              color={
                wishlisted
                  ? C.red
                  : C.text
              }
            />
          </TouchableOpacity>
        )}


        {out && (
          <View
            style={
              styles.outStrip
            }
          >
            <Text
              style={
                styles.outT
              }
            >
              Out of stock
            </Text>
          </View>
        )}
      </View>
    );


  const info =
    (
      <>
        <Text
          numberOfLines={
            2
          }
          style={
            styles.name
          }
        >
          {p.name}
        </Text>


        <Text
          style={
            styles.muted
          }
        >
          {details ||
            p.unit}
        </Text>


        {p.rating >
          0 && (
          <View
            style={{
              flexDirection:
                'row',

              alignItems:
                'center',

              marginTop: 2,
            }}
          >
            <Ionicons
              name="star"
              size={12}
              color={
                C.amber
              }
            />

            <Text
              style={[
                styles.muted,
                {
                  marginLeft:
                    3,
                },
              ]}
            >
              {p.rating}
            </Text>
          </View>
        )}


        <View
          style={
            styles.priceRow
          }
        >
          <Text
            numberOfLines={
              1
            }
            style={
              styles.price
            }
          >
            {rs(
              p.price
            )}
          </Text>


          {p.original_price >
            p.price && (
            <Text
              numberOfLines={
                1
              }
              style={
                styles.strike
              }
            >
              {rs(
                p.original_price
              )}
            </Text>
          )}
        </View>
      </>
    );


  if (row) {
    return (
      <TouchableOpacity
        activeOpacity={
          0.9
        }
        onPress={() =>
          onPress(p)
        }
        style={[
          styles.card,
          {
            flexDirection:
              'row',

            alignItems:
              'center',
          },
          style,
        ]}
      >
        {photo}

        <View
          style={{
            flex: 1,
            marginLeft: 12,
          }}
        >
          {info}

          <View
            style={{
              marginTop: 8,
              width: 120,
            }}
          >
            {action}
          </View>
        </View>
      </TouchableOpacity>
    );
  }


  return (
    <TouchableOpacity
      activeOpacity={
        0.9
      }
      onPress={() =>
        onPress(p)
      }
      style={[
        styles.card,
        style,
      ]}
    >
      {photo}

      {info}

      <View
        style={{
          marginTop: 8,
        }}
      >
        {action}
      </View>
    </TouchableOpacity>
  );
}


export default memo(
  ProductCard
);


/* ============================================================
 * STYLES
 * ============================================================ */

const styles =
  StyleSheet.create({

    /*
     * ========================================================
     * COMPACT 4-COLUMN CARD
     * ========================================================
     */

    compactCard: {
      backgroundColor:
        '#FFFFFF',

      borderRadius: 8,

      paddingHorizontal: 3,
      paddingTop: 3,
      paddingBottom: 4,

      /*
       * Do NOT give this card a grey background.
       * The page around it remains C.bg.
       */
    },


    compactPress: {
      width:
        '100%',
    },


    compactImageWrap: {
      width:
        '100%',

      height: 55,

      backgroundColor:
        '#FFFFFF',

      borderRadius: 7,

      alignItems:
        'center',

      justifyContent:
        'center',

      overflow:
        'hidden',

      position:
        'relative',
    },


    compactImage: {
      width:
        '91%',

      height:
        '91%',

      borderRadius:
        7,
    },


    compactBadge: {
      position:
        'absolute',

      top: 1,
      left: 1,

      backgroundColor:
        C.green,

      borderRadius:
        4,

      paddingHorizontal:
        3,

      paddingVertical:
        1,

      zIndex: 2,
    },


    compactBadgeText: {
      color:
        '#FFFFFF',

      fontFamily:
        FONT.headingBold,

      fontSize: 5.5,

      lineHeight: 7,
    },


    compactName: {
      color:
        C.text,

      fontFamily:
        FONT.heading,

      fontSize: 7.5,

      lineHeight: 9,

      marginTop: 3,

      minHeight: 18,
    },


    compactUnit: {
      color:
        C.muted,

      fontFamily:
        FONT.body,

      fontSize: 6.5,

      lineHeight: 8,

      marginTop: 1,
    },


    compactPriceRow: {
      flexDirection:
        'row',

      alignItems:
        'baseline',

      minHeight:
        11,

      marginTop: 2,
    },


    compactPrice: {
      color:
        C.text,

      fontFamily:
        FONT.headingBold,

      fontSize: 8.5,

      lineHeight: 10,
    },


    compactStrike: {
      color:
        C.muted,

      fontSize: 6,

      marginLeft: 2,

      textDecorationLine:
        'line-through',
    },


    compactAdd: {
      height: 17,

      width:
        '100%',

      borderRadius: 4,

      backgroundColor:
        C.green,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop: 3,
    },


    compactAddText: {
      color:
        '#FFFFFF',

      fontFamily:
        FONT.headingBold,

      fontSize: 7,

      lineHeight: 8,

      marginLeft: 2,
    },


    compactStepper: {
      height: 17,

      width:
        '100%',

      borderRadius: 4,

      backgroundColor:
        C.green,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      marginTop: 3,
    },


    compactStep: {
      width: 15,
      height: 17,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    compactQty: {
      color:
        '#FFFFFF',

      fontFamily:
        FONT.headingBold,

      fontSize: 8,

      textAlign:
        'center',
    },


    compactSold: {
      height: 17,

      width:
        '100%',

      borderRadius: 4,

      backgroundColor:
        '#EEF1ED',

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop: 3,
    },


    compactSoldText: {
      color:
        C.muted,

      fontFamily:
        FONT.headingBold,

      fontSize: 7,
    },


    /*
     * ========================================================
     * NORMAL CARD
     * ========================================================
     */

    card: {
      backgroundColor:
        C.card,

      borderRadius:
        R,

      padding: 10,

      borderWidth: 1,

      borderColor:
        '#E8EFE1',
    },


    img: {
      width:
        '100%',

      aspectRatio:
        1,

      borderRadius:
        10,
    },


    badge: {
      position:
        'absolute',

      top: 6,
      left: 6,

      backgroundColor:
        C.green,

      borderRadius:
        6,

      paddingHorizontal:
        6,

      paddingVertical:
        2,
    },


    badgeT: {
      color:
        '#FFFFFF',

      fontSize: 10,

      fontFamily:
        FONT.headingBold,
    },


    heart: {
      position:
        'absolute',

      top: 4,
      right: 4,

      width: 28,
      height: 28,

      borderRadius: 14,

      backgroundColor:
        'rgba(255,255,255,0.94)',

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    outStrip: {
      position:
        'absolute',

      left: 0,
      right: 0,
      bottom: 0,

      backgroundColor:
        'rgba(29,58,39,0.72)',

      paddingVertical:
        3,

      alignItems:
        'center',

      borderBottomLeftRadius:
        10,

      borderBottomRightRadius:
        10,
    },


    outT: {
      color:
        '#FFFFFF',

      fontSize: 10,

      fontFamily:
        FONT.heading,
    },


    name: {
      fontFamily:
        FONT.heading,

      color:
        C.text,

      marginTop: 8,

      minHeight: 36,
    },


    muted: {
      color:
        C.muted,

      fontSize: 12,

      fontFamily:
        FONT.body,
    },


    priceRow: {
      flexDirection:
        'row',

      alignItems:
        'baseline',

      flexWrap:
        'wrap',

      marginTop: 6,
    },


    price: {
      fontFamily:
        FONT.headingBold,

      color:
        C.text,

      fontSize: 15,

      marginRight: 6,
    },


    strike: {
      color:
        C.muted,

      fontSize: 12,

      textDecorationLine:
        'line-through',
    },


    addBtn: {
      height: 34,

      borderRadius: 10,

      backgroundColor:
        C.green,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    addBtnT: {
      color:
        '#FFFFFF',

      fontFamily:
        FONT.headingBold,

      fontSize: 13,

      marginLeft: 6,
    },


    stepBtn: {
      width: 30,
      height: 30,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    qty: {
      color:
        '#FFFFFF',

      fontFamily:
        FONT.headingBold,

      fontSize: 14,

      minWidth: 24,

      textAlign:
        'center',
    },
  });