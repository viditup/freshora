import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, errMsg } from '../api';
import Loading from '../components/Loading';
import ErrorState, { Empty } from '../components/ErrorState';
import AppHeader from '../components/AppHeader';
import Img from '../components/Img';
import { catEmoji, countLabel } from '../components/CategoryCard';
import D from '../designImages';
import { C, FONT } from '../theme';

// ALL CATEGORIES PAGE
const REF_W = 850;

// Set to false to show the real product_count / description
// from the backend instead of the design texts.
const USE_DESIGN_TEXT = true;

// ============================================================
// PHOTO POSITIONS
// ============================================================
//
// 0    = top
// 0.5  = middle
// 1    = bottom
//
// IMPORTANT:
// These constants must be declared BEFORE DESIGN because
// DESIGN uses them.
// ============================================================

const POS_GRID = 0.35;
const POS_FEAT = 0.45;

// Organic + Beverages ko upar rakhne ke liye
const POS_FEAT_UP = 0.15;

// Extra vertical shift.
// Normal categories ke liye 40.
// Organic/Beverages ke liye individually override kiya gaya hai.
const NORMAL_SHIFT = 40;

// Organic/Beverages ko upar lane ke liye negative shift.
const FEAT_UP_SHIFT = -5;

// ============================================================
// DESIGN ORDER + DESIGN TEXT
// ============================================================

const DESIGN = [
  {
    rx: /fruit|veg/i,
    name: 'Fruits & Vegetables',
    count: '600+ items',
    desc: 'Fresh produce for a healthier you',
    art: 'cs_fruits',
    pos: POS_GRID,
    shift: NORMAL_SHIFT,
    bg: '#E4F3D9',
  },

  {
    rx: /dairy|milk|breakfast/i,
    name: 'Dairy & Breakfast',
    count: '300+ items',
    desc: 'Milk, cheese, eggs, cereals and more',
    art: 'cs_dairy',
    pos: POS_GRID,
    shift: NORMAL_SHIFT,
    bg: '#E3EEFA',
  },

  {
    rx: /^(?!.*healthy).*snack/i,
    name: 'Snacks & Beverages',
    count: '400+ items',
    desc: 'Chips, cookies, drinks and more',
    art: 'cs_snacks',
    pos: POS_GRID,
    shift: NORMAL_SHIFT,
    bg: '#FDEBD3',
  },

  {
    rx: /atta|rice|staple|grocer/i,
    name: 'Atta, Rice & Staples',
    count: '300+ items',
    desc: 'Daily essentials for your kitchen',
    art: 'cs_atta',
    pos: POS_GRID,
    shift: NORMAL_SHIFT,
    bg: '#F6EAD6',
  },

  {
    rx: /house/i,
    name: 'Household Essentials',
    count: '250+ items',
    desc: 'Cleaning and home care products',
    art: 'cs_household',
    pos: POS_GRID,
    shift: NORMAL_SHIFT,
    bg: '#E1F1F0',
  },

  {
    rx: /personal/i,
    name: 'Personal Care',
    count: '300+ items',
    desc: 'Beauty and hygiene essentials',
    art: 'cs_personal',
    pos: POS_GRID,
    shift: NORMAL_SHIFT,
    bg: '#FBE4E6',
  },

  {
    rx: /baby/i,
    name: 'Baby Care',
    count: '200+ items',
    desc: 'Gentle care for your little one',
    art: 'cs_baby',
    pos: POS_GRID,
    shift: NORMAL_SHIFT,
    bg: '#E3F1FA',
  },

  {
    rx: /pet/i,
    name: 'Pet Care',
    count: '150+ items',
    desc: 'Food and accessories for your pets',
    art: 'cs_pet',
    pos: POS_GRID,
    shift: NORMAL_SHIFT,
    bg: '#FCE9D2',
  },

  // ==========================================================
  // ORGANIC — UP
  // ==========================================================

  {
    rx: /organic/i,
    name: 'Organic Products',
    count: '120+ items',
    desc: 'Naturally good, always',
    art: 'cs_feat_organic',
    pos: POS_FEAT_UP,
    shift: FEAT_UP_SHIFT,
    bg: '#E4F3D9',
  },

  {
    rx: /healthy/i,
    name: 'Healthy Snacks',
    count: '100+ items',
    desc: 'Nutritious choices for a better you',
    art: 'cs_feat_healthy',
    pos: POS_FEAT,
    shift: NORMAL_SHIFT,
    bg: '#F9EBD0',
  },

  // ==========================================================
  // BEVERAGES — UP
  // ==========================================================

  {
    rx: /^beverages?$/i,
    name: 'Beverages',
    count: '180+ items',
    desc: 'Juices, soft drinks, and more',
    art: 'cs_feat_bev',
    pos: POS_FEAT_UP,
    shift: FEAT_UP_SHIFT,
    bg: '#FDE9D3',
  },

  {
    rx: /clean/i,
    name: 'Cleaning Essentials',
    count: '100+ items',
    desc: 'For a cleaner, greener home',
    art: 'cs_feat_clean',
    pos: POS_FEAT,
    shift: NORMAL_SHIFT,
    bg: '#E3F1F8',
  },
];

const DEFAULT_BG = '#EEF6E4';

export default function AllCategories({ navigation }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState(null);

  const { width } = useWindowDimensions();

  const k = width / REF_W;

  const u = (n) =>
    Math.round(n * k * 10) / 10;

  const f = (n, min = 10) =>
    Math.max(
      min,
      Math.round(n * k * 10) / 10
    );

  // Hide navigator header.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const load = useCallback(async () => {
    try {
      setList(
        (await api.get('/categories')).data.data
      );

      setErr(null);
    } catch (e) {
      setErr(errMsg(e));
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <Loading />;
  }

  if (err && !list.length) {
    return (
      <ErrorState
        message={err}
        onRetry={() => {
          setLoading(true);
          load();
        }}
      />
    );
  }

  const open = (c) =>
    navigation.navigate('Products', {
      categoryId: c.id,
      title: c.name,
    });

  // ============================================================
  // BUILD ROWS
  // ============================================================

  const used = new Set();
  const rows = [];

  DESIGN.forEach((d) => {
    const hit = list.find(
      (c) =>
        !used.has(c.id) &&
        d.rx.test(c.name || '')
    );

    if (hit) {
      used.add(hit.id);

      rows.push({
        c: hit,
        d,
      });
    }
  });

  list.forEach((c) => {
    if (!used.has(c.id)) {
      rows.push({
        c,
        d: null,
      });
    }
  });

  // ============================================================
  // DIMENSIONS
  // ============================================================

  const PAD = u(37);

  const contentW =
    width - PAD * 2;

  const thumbW =
    Math.round(contentW * 0.36);

  const thumbH =
    Math.round(thumbW / 1.4);

  // ============================================================
  // PHOTO BOX
  // ============================================================

  const photoBox = (
    src,
    pos = 0.5,
    shift = NORMAL_SHIFT
  ) => {
    const r =
      Image.resolveAssetSource
        ? Image.resolveAssetSource(src)
        : null;

    const ar =
      r && r.width && r.height
        ? r.width / r.height
        : 494 / 516;

    // Image width required to cover container.
    const w2 = Math.max(
      thumbW,
      thumbH * ar
    );

    // Maintain image aspect ratio.
    const h2 = w2 / ar;

    // Amount of vertical image overflow.
    const overflowY = Math.max(
      0,
      h2 - thumbH
    );

    return {
      position: 'absolute',

      width: w2,
      height: h2,

      // Center horizontally.
      left:
        -(w2 - thumbW) / 2,

      // ========================================================
      // POSITION
      // ========================================================
      //
      // Normal categories:
      //   shift = 40
      //
      // Organic + Beverages:
      //   shift = -5
      //
      // So Organic and Beverages move UP without changing
      // the other categories.
      //
      top:
        -overflowY * pos +
        u(shift),
    };
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* HEADER */}
      <AppHeader scaled />

      <ScrollView
        style={{
          width,
        }}
        contentContainerStyle={{
          paddingBottom: u(26),
          width,
        }}
        bounces
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={C.green}
          />
        }
      >
        {/* ======================================================
            TITLE ROW
           ====================================================== */}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: PAD,
            marginTop: u(22),
          }}
        >
          <View
            style={{
              flex: 1,
              marginRight: u(10),
            }}
          >
            <Text
              maxFontSizeMultiplier={1}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={{
                fontFamily: FONT.headingBold,
                fontSize: u(50),
                lineHeight: u(56),
                color: '#07281B',
                letterSpacing: -0.4,
              }}
            >
              All Categories
            </Text>

            <Text
              maxFontSizeMultiplier={1}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={{
                fontFamily: FONT.body,
                fontSize: f(22, 10.5),
                lineHeight: f(28, 14),
                color: '#5F6673',
                marginTop: u(6),
              }}
            >
              Explore our wide range of products
            </Text>
          </View>

          {/* GOOD FOOD HAPPIER YOU */}
          <View
            style={{
              width: u(250),
              height: u(77),
              borderRadius: u(30),
              backgroundColor: '#E4F5E3',
              flexDirection: 'row',
              alignItems: 'center',
              paddingLeft: u(20),
              paddingRight: u(12),
            }}
          >
            <Ionicons
              name="leaf"
              size={Math.max(18, u(40))}
              color="#3C8A12"
            />

            <View
              style={{
                flex: 1,
                marginLeft: u(12),
              }}
            >
              {[
                'Good Food',
                'Happier You',
              ].map((t) => (
                <Text
                  key={t}
                  maxFontSizeMultiplier={1}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.6}
                  style={{
                    fontFamily: FONT.heading,
                    fontSize: f(17, 9),
                    lineHeight: f(21, 11.5),
                    color: '#0B3A1E',
                  }}
                >
                  {t}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* EMPTY STATE */}
        {!list.length && (
          <Empty
            icon="🗂️"
            title="No categories yet"
            sub="Categories will appear once they are added."
          />
        )}

        {/* ======================================================
            CATEGORY ROWS
           ====================================================== */}

        <View
          style={{
            paddingHorizontal: PAD,
            marginTop: u(22),
          }}
        >
          {rows.map(({ c, d }, i) => {
            const useDesign =
              USE_DESIGN_TEXT && !!d;

            const name = useDesign
              ? d.name
              : c.name;

            const count = useDesign
              ? d.count
              : countLabel(c);

            const desc = useDesign
              ? d.desc
              : c.description || '';

            return (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.85}
                onPress={() => open(c)}
                accessibilityLabel={name}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: u(10),
                  borderBottomWidth:
                    i < rows.length - 1
                      ? 1
                      : 0,
                  borderBottomColor:
                    '#EEF1EC',
                }}
              >
                {/* =================================================
                    IMAGE
                   ================================================= */}

                <View
                  style={{
                    width: thumbW,
                    height: thumbH,
                    borderRadius: u(16),
                    overflow: 'hidden',
                    backgroundColor:
                      d
                        ? d.bg
                        : DEFAULT_BG,
                  }}
                >
                  {d && D[d.art] ? (
                    <Image
                      source={D[d.art]}
                      resizeMode="cover"
                      style={photoBox(
                        D[d.art],
                        d.pos,
                        d.shift
                      )}
                    />
                  ) : (
                    <Img
                      uri={c.image}
                      emoji={catEmoji(c)}
                      fit="contain"
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  )}
                </View>

                {/* =================================================
                    CATEGORY INFO
                   ================================================= */}

                <View
                  style={{
                    flex: 1,
                    marginLeft: u(24),
                    marginRight: u(8),
                  }}
                >
                  <Text
                    maxFontSizeMultiplier={1}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    style={{
                      fontFamily: FONT.heading,
                      fontSize: f(23, 12),
                      lineHeight: f(28, 15),
                      color: '#08140E',
                    }}
                  >
                    {name}
                  </Text>

                  <Text
                    maxFontSizeMultiplier={1}
                    numberOfLines={1}
                    style={{
                      fontFamily: FONT.body,
                      fontSize: f(16, 9.5),
                      lineHeight: f(20, 12),
                      color: '#5F6673',
                      marginTop: u(3),
                    }}
                  >
                    {count}
                  </Text>

                  {!!desc && (
                    <Text
                      maxFontSizeMultiplier={1}
                      numberOfLines={2}
                      style={{
                        fontFamily: FONT.body,
                        fontSize: f(16, 9.5),
                        lineHeight: f(20, 12),
                        color: '#7A8190',
                        marginTop: u(2),
                      }}
                    >
                      {desc}
                    </Text>
                  )}
                </View>

                {/* CHEVRON */}
                <Ionicons
                  name="chevron-forward"
                  size={Math.max(16, u(30))}
                  color="#08140E"
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
