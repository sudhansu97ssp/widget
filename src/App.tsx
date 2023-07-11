import React, { useEffect, useState } from "react";
import Carousal from "./components/Carousal";
import * as styles from "./App.module.css";
import TroopodLogo from "./assets/troopod-logo.svg";
import ReactGA from "react-ga4";
import { useAppSelector, useAppDispatch } from "./app/hooks";
import {
  selectCarousalState,
  fetchProduct,
} from "./components/Carousal/Carousal.slice";
import mixpanel from "mixpanel-browser";
import * as Sentry from "@sentry/react";
import fireAnalytics from "./utils/fire-analytics-event";

Sentry.init({
  dsn: "https://c4e515d63dee43c5af490cf9b660a593@o1162004.ingest.sentry.io/4505079015735296",
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

declare global {
  interface Window {
    ShopifyAnalytics: {
      lib: {
        user: () => {
          traits: () => {
            uniqToken: string;
          };
        };
      };
      meta: {
        page: {
          customerId: string;
        };
      };
    };
  }
}

export function App() {
  const dispatch = useAppDispatch();
  const carousalState = useAppSelector(selectCarousalState);
  const [open, setOpen] = useState(false);
  const [pageLoad, setPageLoad] = useState(false);

  let meta: HTMLMetaElement = document.createElement("meta");
  meta.name = "viewport";
  meta.content = "width=device-width, initial-scale=1";
  document.getElementsByTagName("head")[0].appendChild(meta);

  var link = document.createElement("link");
  link.rel = "preconnect";
  link.href = "https://fonts.googleapis.com";
  document.head.appendChild(link);

  var link2 = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300;400;500;600&family=${
    carousalState.product.store?.title_props?.fontFamily ?? "Poppins"
  }:wght@100;200;300;400;500;600&display=swap`;
  document.head.appendChild(link2);

  var link3 = document.createElement("link");
  link3.rel = "preconnect";
  link3.href = "https://fonts.googleapis.com";
  link3.crossOrigin;
  document.head.appendChild(link3);

  const getCustomerId = () => {
    try {
      let curr = window?.ShopifyAnalytics?.meta?.page?.customerId;
      let uniqId = window?.ShopifyAnalytics?.lib?.user()?.traits()?.uniqToken;
      if (curr === undefined || curr === null || curr === "") {
        return uniqId;
      }
    } catch (err) {
      console.log(err);
    }
    return undefined;
  };
  useEffect(() => {
    if (carousalState.product?.store?.ga_stream_id) {
      ReactGA.initialize(carousalState.product?.store?.ga_stream_id);
    }

    ReactGA.set({
      userId:
        document.getElementById("app")?.getAttribute("data-customerId") !=
        ("" as string)
          ? (document
              .getElementById("app")
              ?.getAttribute("data-customerId") as string)
          : getCustomerId(),
    });

    ReactGA.send({ hitType: "pageview", page: window.location.href });
  }, [carousalState.product?.store?.ga_stream_id]);

  useEffect(() => {
    let productId = document
      .getElementById("app")
      ?.getAttribute("data-productId") as string;
    dispatch(fetchProduct({ productId, setPageLoad }));
  }, []);

  try {
    mixpanel.init(carousalState.product?.store?.mixpanel_stream_id!, {
      debug: false,
      loaded: function () {
        return (
          <Carousal
            fireAnalytics={fireAnalytics}
            open={open}
            setOpen={setOpen}
          />
        );
      },
    });
    const uniqueDeviceID = localStorage.getItem("device_ID") as string;
    if (carousalState.product?.store?.mixpanel_stream_id && uniqueDeviceID) {
      mixpanel.identify(uniqueDeviceID);
    }
  } catch (e) {
    console.log("Mixpanel is not initialized", e);
  }

  useEffect(() => {
    if (pageLoad) {
      let analyticParameter = {
        category: "page_load_begins",
        action: "page_load_begins",
      };
      fireAnalytics(analyticParameter);
    }
  }, [pageLoad]);

  return (
    <div>
      {carousalState.status === "idle" &&
        carousalState.product &&
        carousalState.product.media?.length! > 0 && (
          <>
            <Carousal
              open={open}
              setOpen={setOpen}
              fireAnalytics={fireAnalytics}
            />
            <div className={styles.pushStarters_App_poweredDiv}>
              <a
                href="https://troopod.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={TroopodLogo}
                  alt="troopod_logo"
                  className={styles.pushStarters_App_logo}
                />
              </a>
              <a
                href="https://troopod.io/"
                className={styles.pushStarters_App_powered}
                target="_blank"
                rel="noopener noreferrer"
              >
                Powered by Troopod
              </a>
            </div>
          </>
        )}
    </div>
  );
}
