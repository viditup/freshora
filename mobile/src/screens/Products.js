import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { api, errMsg } from '../api';

import AppHeader from '../components/AppHeader'; // same header as Home (location + search bar)
import Loading from '../components/Loading';
import ErrorState, {
  Empty,
} from '../components/ErrorState';

import ProductGrid from '../components/ProductGrid';
import SubCategoryRow from '../components/SubCategoryRow';

import HomeProductSection from '../components/HomeProducts';

import { useCart } from '../context/CartContext';


import {
  EMPTY_FILTERS,
  FilterSheet,
  MultiSheet,
  OptionSheet,
  PRICES,
  SORTS,
  activeCount,
  sortLabel,
} from '../components/FilterSheet';

import {
  C,
  FS,
  RAD,
  S,
  FONT,
} from '../theme';


/*
 * ============================================================
 * PRODUCTS / CATEGORY SCREEN
 * ============================================================
 *
 * TARGET DESIGN:
 *
 * Greenish page background
 *
 * Back arrow
 * Fruits & Vegetables
 * subtitle
 * Eat Fresh Stay Healthy pill
 *
 * Category chips
 *
 * Freshness Picked for You
 *
 * Popular Products
 * 4 compact products per row
 *
 * Go Organic, Go Healthy
 *
 * You May Also Like
 *
 * IMPORTANT:
 * - No grey page background
 * - No filter bar in main UI
 * - No grid/list toggle
 * - No product count
 * - Existing API/cart/navigation preserved
 */


/* ============================================================
 * SMALL HEALTH PILL
 * ============================================================ */

const HealthPill = () => {
  return (
    <View
      style={{
        height: 30,
        minWidth: 94,
        paddingHorizontal: 9,
        borderRadius: 16,

        // Keep the original greenish theme.
        backgroundColor: C.tint,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons
        name="leaf"
        size={12}
        color={C.green}
      />

      <View
        style={{
          marginLeft: 5,
        }}
      >
        <Text
          style={{
            color: C.green,
            fontFamily: FONT.headingBold,
            fontSize: 7.5,
            lineHeight: 9,
          }}
        >
          Eat Fresh
        </Text>

        <Text
          style={{
            color: C.green,
            fontFamily: FONT.bodySemi,
            fontSize: 6.5,
            lineHeight: 7,
          }}
        >
          Stay Healthy
        </Text>
      </View>

      <Ionicons
        name="heart"
        size={8}
        color={C.green}
        style={{
          marginLeft: 3,
        }}
      />
    </View>
  );
};


/* ============================================================
 * IMAGE BANNER
 *
 * The banner artwork (text, button, leaves, basket) is ONE
 * image exported from the design, so it matches exactly.
 * Put the two files in  assets/banners/  (see require paths).
 * ============================================================ */

const BANNER_FRESH = require('../../assets/banners/banner_freshness.png');
const BANNER_ORGANIC = require('../../assets/banners/banner_organic.png');

/*
 * btn = position/size of the button INSIDE the artwork, in
 * the image's own pixels {x, y, w, h}. A real (transparent)
 * touchable button is placed exactly on top of it, so it has
 * the same shape and size as the one in the design.
 */
const ImageBanner = ({
  source,
  w,
  h,
  btn,
  onPress,
}) => (
  <View
    style={{
      width: '100%',
      aspectRatio: w / h,
      borderRadius: 14,
      overflow: 'hidden',
    }}
  >
    {/* Whole banner is tappable too */}
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <Image
        source={source}
        resizeMode="cover"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </TouchableOpacity>

    {/* Button overlay: same shape + size as the image button */}
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      style={{
        position: 'absolute',
        left: `${(btn.x / w) * 100}%`,
        top: `${(btn.y / h) * 100}%`,
        width: `${(btn.w / w) * 100}%`,
        height: `${(btn.h / h) * 100}%`,
        borderRadius: 999,
      }}
    />
  </View>
);


/* ============================================================
 * EXTRA CATEGORY CHIPS
 *
 * Shown after the API chips so the row has more categories
 * (matches the design: Fresh Fruits, Fresh Vegetables, Leafy
 * Greens, Exotic Fruits, Herbs & Seasonings, Organic ...).
 * API chips always come first; duplicates are skipped.
 * ============================================================ */

const EXTRA_CHIPS = [
  { value: 'fresh-fruits', label: 'Fresh Fruits' },
  { value: 'fresh-vegetables', label: 'Fresh Vegetables' },
  { value: 'leafy-greens', label: 'Leafy Greens' },
  { value: 'exotic-fruits', label: 'Exotic Fruits' },
  { value: 'herbs-seasonings', label: 'Herbs & Seasonings' },
  { value: 'roots-tubers', label: 'Roots & Tubers' },
  { value: 'organic-products', label: 'Organic' },
];

const withExtraChips = (base) => {
  const seen = new Set(
    base.map((c) =>
      String(c.label || c.value).toLowerCase()
    )
  );

  return [
    ...base,
    ...EXTRA_CHIPS.filter(
      (x) =>
        !seen.has(x.label.toLowerCase())
    ),
  ];
};


/* ============================================================
 * SECTION TITLE
 * ============================================================ */

const SectionTitle = ({
  title,
  onSeeAll,
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        paddingHorizontal: 10,

        marginTop: 4,
        marginBottom: 5,
      }}
    >
      <Text
        style={{
          color: C.dark2,
          fontFamily: FONT.headingBold,
          fontSize: 12,
          lineHeight: 15,
        }}
      >
        {title}
      </Text>

      <TouchableOpacity
        onPress={onSeeAll}
        activeOpacity={0.75}
        hitSlop={{
          top: 8,
          bottom: 8,
          left: 8,
          right: 8,
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: C.green,
            fontFamily: FONT.heading,
            fontSize: 7.5,
          }}
        >
          See All
        </Text>

        <Ionicons
          name="arrow-forward"
          size={9}
          color={C.green}
          style={{
            marginLeft: 2,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};


/* ============================================================
 * MAIN SCREEN
 * ============================================================ */

export default function Products({
  route,
  navigation,
}) {
  const {
    categoryId,
  } = route.params || {};


  /* ----------------------------------------------------------
   * FILTER STATE
   * ---------------------------------------------------------- */

  const [
    f,
    setF,
  ] = useState({
    ...EMPTY_FILTERS,
    sort:
      route.params?.sort ||
      'newest',
  });


  const [
    sub,
    setSub,
  ] = useState(null);


  const [
    facets,
    setFacets,
  ] = useState(null);


  const [
    sheet,
    setSheet,
  ] = useState(null);


  /* ----------------------------------------------------------
   * PRODUCTS
   * ---------------------------------------------------------- */

  const [
    items,
    setItems,
  ] = useState([]);


  const [
    page,
    setPage,
  ] = useState(1);


  const [
    pages,
    setPages,
  ] = useState(1);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    more,
    setMore,
  ] = useState(false);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    err,
    setErr,
  ] = useState(null);


  /* ----------------------------------------------------------
   * CATEGORY
   * ---------------------------------------------------------- */

  const [
    cat,
    setCat,
  ] = useState(null);


  /* ----------------------------------------------------------
   * FEATURED / ALSO LIKE
   * ---------------------------------------------------------- */

  const [
    also,
    setAlso,
  ] = useState([]);


  const {
    add,
  } = useCart();


  /* Hide the stack's own header (the extra back arrow on top);
     Home's AppHeader is rendered inside this screen instead. */
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);


  /* ==========================================================
   * API QUERY
   * ========================================================== */

  const query = useMemo(
    () => ({
      category:
        categoryId ||
        undefined,

      subcategory:
        sub ||
        undefined,

      sort:
        f.sort,

      min_price:
        f.price.min ??
        undefined,

      max_price:
        f.price.max ??
        undefined,

      brand:
        f.brands.length
          ? f.brands.join(',')
          : undefined,

      organic:
        f.organic ||
        undefined,

      min_rating:
        f.minRating ??
        undefined,

      in_stock:
        f.inStock ||
        undefined,
    }),
    [
      categoryId,
      sub,
      f,
    ]
  );


  /* ==========================================================
   * FETCH PRODUCTS
   * ========================================================== */

  const fetchPage =
    useCallback(
      async (p) => {
        try {
          const {
            data,
          } = await api.get(
            '/products',
            {
              params: {
                ...query,

                page: p,

                // More products gives the compact
                // 4-column layout enough data.
                limit: 20,
              },
            }
          );


          setItems(
            (prev) =>
              p === 1
                ? (
                    data.data ||
                    []
                  )
                : [
                    ...prev,
                    ...(data.data ||
                      []),
                  ]
          );


          setPage(p);


          setPages(
            data.pagination
              ?.total_pages ||
              1
          );


          setErr(null);
        } catch (e) {
          setErr(
            errMsg(e)
          );
        }


        setLoading(false);
        setMore(false);
        setRefreshing(false);
      },
      [query]
    );


  useEffect(() => {
    setLoading(true);

    fetchPage(1);
  }, [fetchPage]);


  /* ==========================================================
   * FACETS
   * ========================================================== */

  useEffect(() => {
    let alive = true;


    api
      .get(
        '/products/facets',
        {
          params: categoryId
            ? {
                category:
                  categoryId,
              }
            : {},
        }
      )
      .then(
        ({
          data,
        }) => {
          if (alive) {
            setFacets(
              data.data
            );
          }
        }
      )
      .catch(() => {
        if (alive) {
          setFacets(null);
        }
      });


    return () => {
      alive = false;
    };
  }, [categoryId]);


  /* ==========================================================
   * CATEGORY INFO
   * ========================================================== */

  useEffect(() => {
    let alive = true;


    if (!categoryId) {
      setCat(null);

      return undefined;
    }


    api
      .get('/categories')
      .then(
        ({
          data,
        }) => {
          if (!alive) {
            return;
          }


          const found =
            (
              data.data ||
              []
            ).find(
              (c) =>
                c.id ===
                  categoryId ||
                c.slug ===
                  categoryId
            );


          setCat(
            found ||
            null
          );
        }
      )
      .catch(() => {});


    return () => {
      alive = false;
    };
  }, [categoryId]);


  /* ==========================================================
   * FEATURED PRODUCTS
   *
   * Used for:
   * - You May Also Like
   * - filling compact Popular Products when category API
   *   returns fewer than 8 items.
   * ========================================================== */

  useEffect(() => {
    let alive = true;


    api
      .get(
        '/products/featured',
        {
          params: {
            limit: 20,
          },
        }
      )
      .then(
        ({
          data,
        }) => {
          if (alive) {
            setAlso(
              data.data ||
              []
            );
          }
        }
      )
      .catch(() => {});


    return () => {
      alive = false;
    };
  }, []);


  /* ==========================================================
   * RESET SUBCATEGORY
   * ========================================================== */

  useEffect(() => {
    setSub(null);
  }, [categoryId]);


  /* ==========================================================
   * CHIPS
   * ========================================================== */

  const apiChips =
    categoryId
      ? (
          facets?.subcategories ||
          []
        )
      : (
          facets?.categories ||
          []
        );

  const chips =
    withExtraChips(apiChips);


  /* ==========================================================
   * ACTIVE FILTERS
   * ========================================================== */

  const nActive =
    activeCount(f);


  const clearAll =
    () => {
      setF({
        ...EMPTY_FILTERS,
      });

      setSub(null);
    };


  const onChip =
    (c) => {
      if (categoryId) {
        setSub(
          sub === c.value
            ? null
            : c.value
        );
      } else {
        navigation.setParams({
          categoryId:
            c.value,

          title:
            c.label ||
            c.value,
        });
      }
    };


  /* ==========================================================
   * LOADING
   * ========================================================== */

  if (
    loading &&
    !items.length
  ) {
    return <Loading />;
  }


  /* ==========================================================
   * ERROR
   * ========================================================== */

  if (
    err &&
    !items.length
  ) {
    return (
      <ErrorState
        message={err}
        onRetry={() => {
          setLoading(true);
          fetchPage(1);
        }}
      />
    );
  }


  /* ==========================================================
   * LABELS
   * ========================================================== */

  const catName =
    cat?.name ||
    route.params?.title ||
    'Fruits & Vegetables';


  const subLabel =
    sub
      ? (
          chips.find(
            (c) =>
              c.value ===
              sub
          )?.label ||
          sub
        )
      : null;


  /* ==========================================================
   * POPULAR PRODUCTS
   *
   * IMPORTANT:
   * Category products stay first.
   * Featured products are only used to fill empty visual
   * slots when the category has fewer than 8 products.
   * ========================================================== */

  const popularItems =
    [
      ...items,

      ...also.filter(
        (featured) =>
          !items.some(
            (item) =>
              item.id ===
              featured.id
          )
      ),
    ].slice(0, 8);


  /* ==========================================================
   * ALSO LIKE
   * ========================================================== */

  const alsoItems =
    also
      .filter(
        (x) =>
          !popularItems.some(
            (p) =>
              p.id === x.id
          )
      )
      .slice(0, 8);


  /* ==========================================================
   * HEADER
   * ========================================================== */

  const header =
    (
      <View
        style={{
          /*
           * IMPORTANT:
           * Never use grey here.
           * This is the same greenish theme background.
           */
          backgroundColor:
            C.bg,

          paddingBottom: 4,
        }}
      >

        {/* --------------------------------------------------
            TOP HEADER
           -------------------------------------------------- */}

        <View
          style={{
            paddingHorizontal: 10,
            paddingTop: 4,
            paddingBottom: 2,
          }}
        >
          <View
            style={{
              flexDirection:
                'row',

              alignItems:
                'center',
            }}
          >

            {/* Back */}
            <TouchableOpacity
              onPress={() =>
                navigation.goBack()
              }
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
              style={{
                width: 24,
                height: 28,

                alignItems:
                  'flex-start',

                justifyContent:
                  'center',
              }}
            >
              <Ionicons
                name="chevron-back"
                size={19}
                color={
                  C.dark2
                }
              />
            </TouchableOpacity>


            {/* Title */}
            <View
              style={{
                flex: 1,
                marginLeft: 1,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  color:
                    C.dark2,

                  fontFamily:
                    FONT.headingBold,

                  fontSize: 14,

                  lineHeight: 17,
                }}
              >
                {subLabel ||
                  catName}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color:
                    C.muted,

                  fontFamily:
                    FONT.body,

                  fontSize: 7.5,

                  lineHeight: 10,

                  marginTop: 0,
                }}
              >
                {cat?.description ||
                  'Farm-fresh fruits and vegetables.'}
              </Text>
            </View>


            {/* Health pill */}
            <HealthPill />
          </View>
        </View>


        {/* --------------------------------------------------
            CATEGORY CHIPS
           -------------------------------------------------- */}

        {chips.length >
          0 && (
          <View
            style={{
              /*
               * No fixed height: the old height 54 was
               * cutting the chip boxes from the bottom.
               */
              minHeight: 84,

              paddingTop: 4,

              /* gap between the chips and the banner */
              paddingBottom: 12,

              backgroundColor:
                C.bg,
            }}
          >
            <SubCategoryRow
              chips={chips}
              sub={sub}
              onAll={() =>
                setSub(null)
              }
              onChip={
                onChip
              }
            />
          </View>
        )}


        {/* --------------------------------------------------
            FRESHNESS BANNER
           -------------------------------------------------- */}

        {!sub && (
          <View
            style={{
              paddingHorizontal: 10,
              paddingTop: 2,
              paddingBottom: 6,
            }}
          >
            <ImageBanner
              source={BANNER_FRESH}
              w={434}
              h={118}
              btn={{ x: 18, y: 83, w: 93, h: 24 }}
              onPress={() =>
                setF(
                  (p) => ({
                    ...p,
                    organic:
                      false,
                  })
                )
              }
            />
          </View>
        )}


        {/* --------------------------------------------------
            POPULAR PRODUCTS TITLE
           -------------------------------------------------- */}

        <SectionTitle
          title={
            subLabel ||
            'Popular Products'
          }
          onSeeAll={() =>
            navigation.push(
              'Products',
              {
                categoryId,
                title:
                  catName,
              }
            )
          }
        />
      </View>
    );


  /* ==========================================================
   * FOOTER
   * ========================================================== */

  const footer =
    more ? (
      <ActivityIndicator
        color={
          C.green
        }
        style={{
          marginVertical: 14,
        }}
      />
    ) : (
      <View
        style={{
          /*
           * Same greenish background
           * behind all lower sections.
           */
          backgroundColor:
            C.bg,

          paddingTop: 3,
        }}
      >

        {/* --------------------------------------------------
            ORGANIC BANNER
           -------------------------------------------------- */}

        {!/organic/i.test(
          catName
        ) && (
          <View
            style={{
              paddingHorizontal: 10,
              marginTop: 4,
            }}
          >
            <ImageBanner
              source={BANNER_ORGANIC}
              w={438}
              h={114}
              btn={{ x: 22, y: 77, w: 116, h: 24 }}
              onPress={() =>
                navigation.push(
                  'Products',
                  {
                    categoryId:
                      'organic-products',

                    title:
                      'Organic Products',
                  }
                )
              }
            />
          </View>
        )}


        {/* --------------------------------------------------
            YOU MAY ALSO LIKE
           -------------------------------------------------- */}

        {alsoItems.length >
          0 && (
          <View
            style={{
              marginTop: 4,
              paddingBottom: 18,
            }}
          >
            <HomeProductSection
              title="You May Also Like"

              products={
                alsoItems
              }

              onAll={() =>
                navigation.push(
                  'Products',
                  {
                    title:
                      'All Products',
                  }
                )
              }

              onProduct={
                (p) =>
                  navigation.navigate(
                    'ProductDetails',
                    {
                      id: p.id,
                    }
                  )
              }

              onAdd={
                (p) =>
                  add(
                    p.id
                  )
              }
            />
          </View>
        )}
      </View>
    );


  /* ==========================================================
   * FINAL SCREEN
   * ========================================================== */

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.bg,
      }}
    >
      {/* Same header as Home: delivering-to + search bar */}
      <AppHeader scaled />

      <ProductGrid
        data={
          popularItems
        }

        /*
         * IMPORTANT:
         * Compact 4-column target layout.
         */
        compact

        refreshing={
          refreshing
        }

        onRefresh={() => {
          setRefreshing(
            true
          );

          fetchPage(1);
        }}

        onEnd={() => {
          if (
            !more &&
            page < pages
          ) {
            setMore(
              true
            );

            fetchPage(
              page + 1
            );
          }
        }}

        ListHeaderComponent={
          header
        }

        ListFooterComponent={
          footer
        }

        ListEmptyComponent={
          <Empty
            icon="🥕"
            title="No products found"

            sub={
              nActive > 0 ||
              sub
                ? 'Try removing a filter.'
                : 'Try another category.'
            }

            action={
              nActive > 0 ||
              sub
                ? 'Clear filters'
                : undefined
            }

            onAction={
              clearAll
            }
          />
        }
      />


      {/* ======================================================
          FILTER SHEETS
          Kept intact for functionality.
          They are simply not shown as permanent buttons
          in the target UI.
         ====================================================== */}

      <FilterSheet
        visible={
          sheet ===
          'filters'
        }

        onClose={() =>
          setSheet(null)
        }

        value={f}

        facets={
          facets
        }

        onApply={
          setF
        }
      />


      <OptionSheet
        visible={
          sheet ===
          'sort'
        }

        title="Sort by"

        options={
          SORTS
        }

        value={
          f.sort
        }

        onSelect={
          (o) =>
            setF(
              (p) => ({
                ...p,
                sort:
                  o.value,
              })
            )
        }

        onClose={() =>
          setSheet(null)
        }
      />


      <OptionSheet
        visible={
          sheet ===
          'price'
        }

        title="Price"

        options={
          PRICES
        }

        value={
          f.price.value
        }

        onSelect={
          (o) =>
            setF(
              (p) => ({
                ...p,
                price: o,
              })
            )
        }

        onClose={() =>
          setSheet(null)
        }
      />


      <MultiSheet
        visible={
          sheet ===
          'brand'
        }

        title="Brand"

        values={
          f.brands
        }

        options={(
          facets?.brands ||
          []
        ).map(
          (b) => ({
            value:
              b.value,

            label:
              b.value,

            count:
              `${b.count} items`,
          })
        )}

        onToggle={
          (v) =>
            setF(
              (p) => ({
                ...p,

                brands:
                  p.brands.includes(
                    v
                  )
                    ? p.brands.filter(
                        (x) =>
                          x !==
                          v
                      )
                    : [
                        ...p.brands,
                        v,
                      ],
              })
            )
        }

        onClear={() =>
          setF(
            (p) => ({
              ...p,
              brands: [],
            })
          )
        }

        onClose={() =>
          setSheet(null)
        }
      />
    </View>
  );
}