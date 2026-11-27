"use strict";



/* ==================================================
   FIGURE 1 — AND
   ALI: LIFE EXPECTANCY BY GENDER

  

   HTML:
   #ali-country
   #ali-reset
   #ali-window
   #ali-life-expectancy-chart

   STORY:
   Female and male life expectancy have both
   increased over time.
================================================== */


(() => {

    const config = {

        target: "#ali-life-expectancy-chart",

        file: "life_expectancy.csv",

        keys: [
            {
                key: "female",
                label: "Female",
                color: "#8869bd"
            },

            {
                key: "male",
                label: "Male",
                color: "#1e91a8"
            }
        ],

        unit: "years"
    };


    const width = 750;
    const height = 350;

    const margin = {
        top: 20,
        right: 22,
        bottom: 43,
        left: 62
    };


    const innerWidth =
        width -
        margin.left -
        margin.right;

    const innerHeight =
        height -
        margin.top -
        margin.bottom;


    let data = [];

    let currentCountry =
        "United States";

    let selectedRange = null;


    const tooltip =
        d3.select("body")
            .append("div")
            .attr(
                "class",
                "ali-tooltip"
            )
            .style(
                "display",
                "none"
            );


    const countryControl =
        d3.select("#ali-country");


    /*
    Stop if Ali's HTML has not
    been added yet.
    */
    if (countryControl.empty()) {
        return;
    }


    /*
    ==============================================
    LOAD LIFE EXPECTANCY DATA
    ==============================================
    */

    d3.csv(
        config.file,

        d => {

            const row = {

                country: d.country,

                year: +d.year

            };


            config.keys.forEach(
                key => {

                    row[key.key] =
                        d[key.key] === ""

                            ? null

                            : Number(
                                d[key.key]
                            );

                }
            );


            return row;
        }
    )

    .then(result => {

        data = result;


        /*
        Get list of available countries.
        */

        const countries =
            [
                ...new Set(
                    data.map(
                        d => d.country
                    )
                )
            ]
            .sort();


        /*
        If United States isn't available,
        begin with first country.
        */

        if (
            !countries.includes(
                currentCountry
            )
        ) {

            currentCountry =
                countries[0];
        }


        /*
        Fill country menu.
        */

        countryControl
            .selectAll("option")
            .data(countries)
            .join("option")
            .attr(
                "value",
                d => d
            )
            .text(
                d => d
            );


        countryControl
            .property(
                "value",
                currentCountry
            )

            .on(
                "change",

                event => {

                    currentCountry =
                        event.target.value;

                    selectedRange =
                        null;

                    render();
                }
            );


        /*
        Reset Zoom
        */

        d3.select("#ali-reset")
            .on(
                "click",

                () => {

                    selectedRange =
                        null;

                    render();
                }
            );


        render();

    })

    .catch(error => {

        console.error(
            "Could not load life_expectancy.csv:",
            error
        );


        d3.select(
            "#ali-life-expectancy-chart"
        )
            .text(
                "Could not load life_expectancy.csv."
            );

    });



    /*
    ==============================================
    RENDER ALI VISUAL
    ==============================================
    */

    function render() {

        const container =
            d3.select(
                config.target
            );


        container
            .selectAll("svg")
            .remove();


        const countryData =
            data
                .filter(
                    d =>
                        d.country ===
                        currentCountry
                )

                .sort(
                    (a, b) =>
                        d3.ascending(
                            a.year,
                            b.year
                        )
                );


        if (!countryData.length) {
            return;
        }


        /*
        Determine displayed years.
        */

        const fullYearExtent =
            d3.extent(
                countryData,
                d => d.year
            );


        const visibleYears =
            selectedRange ||
            fullYearExtent;


        d3.select("#ali-window")
            .text(
                selectedRange

                    ? `${Math.round(
                        selectedRange[0]
                    )}–${Math.round(
                        selectedRange[1]
                    )}`

                    : "All years"
            );


        /*
        SVG
        */

        const svg =
            container
                .append("svg")
                .attr(
                    "viewBox",
                    `0 0 ${width} ${height}`
                )
                .attr(
                    "role",
                    "img"
                )
                .attr(
                    "aria-label",
                    `${currentCountry} life expectancy by gender over time`
                );


        const chart =
            svg.append("g")
                .attr(
                    "transform",
                    `translate(
                        ${margin.left},
                        ${margin.top}
                    )`
                );


        /*
        X SCALE
        */

        const x =
            d3.scaleLinear()
                .domain(
                    visibleYears
                )
                .range([
                    0,
                    innerWidth
                ]);


        /*
        Y SCALE
        */

        const values =
            countryData
                .filter(
                    d =>
                        d.year >=
                            visibleYears[0] &&
                        d.year <=
                            visibleYears[1]
                )
                .flatMap(
                    d =>
                        config.keys.map(
                            key =>
                                d[key.key]
                        )
                )
                .filter(
                    Number.isFinite
                );


        const lower =
            Math.max(
                0,
                d3.min(values) - 8
            );


        const upper =
            d3.max(values) + 4;


        const y =
            d3.scaleLinear()
                .domain([
                    lower,
                    upper
                ])
                .nice()
                .range([
                    innerHeight,
                    0
                ]);


        /*
        GRID
        */

        chart.append("g")
            .attr(
                "class",
                "ali-grid"
            )
            .call(
                d3.axisLeft(y)
                    .ticks(6)
                    .tickSize(
                        -innerWidth
                    )
                    .tickFormat("")
            );


        /*
        X AXIS
        */

        chart.append("g")
            .attr(
                "class",
                "ali-axis"
            )
            .attr(
                "transform",
                `translate(
                    0,
                    ${innerHeight}
                )`
            )
            .call(
                d3.axisBottom(x)
                    .ticks(7)
                    .tickFormat(
                        d3.format("d")
                    )
            );


        /*
        Y AXIS
        */

        chart.append("g")
            .attr(
                "class",
                "ali-axis"
            )
            .call(
                d3.axisLeft(y)
                    .ticks(6)
            );


        /*
        DRAW FEMALE + MALE LINES
        */

        config.keys.forEach(
            key => {

                const line =
                    d3.line()
                        .defined(
                            d =>
                                Number.isFinite(
                                    d[key.key]
                                )
                        )
                        .x(
                            d =>
                                x(d.year)
                        )
                        .y(
                            d =>
                                y(
                                    d[key.key]
                                )
                        );


                chart.append("path")
                    .datum(
                        countryData
                    )
                    .attr(
                        "class",
                        "ali-line"
                    )
                    .attr(
                        "fill",
                        "none"
                    )
                    .attr(
                        "stroke",
                        key.color
                    )
                    .attr(
                        "stroke-width",
                        3
                    )
                    .attr(
                        "d",
                        line
                    );

            }
        );


        /*
        ==============================================
        BRUSH / ZOOM
        ==============================================
        */

        const brush =
            d3.brushX()
                .extent([
                    [0, 0],
                    [
                        innerWidth,
                        innerHeight
                    ]
                ])

                .on(
                    "end",

                    event => {

                        if (!event.selection) {
                            return;
                        }


                        const [
                            start,
                            end
                        ] =
                            event.selection
                                .map(
                                    x.invert
                                );


                        if (
                            Math.abs(
                                end -
                                start
                            ) < 1
                        ) {

                            return;
                        }


                        selectedRange = [
                            Math.max(
                                fullYearExtent[0],
                                start
                            ),

                            Math.min(
                                fullYearExtent[1],
                                end
                            )
                        ];


                        render();
                    }
                );


        chart.append("g")
            .attr(
                "class",
                "ali-brush"
            )
            .call(
                brush
            );


        /*
        ==============================================
        HOVER
        ==============================================
        */

        const crosshair =
            chart.append("g")
                .style(
                    "display",
                    "none"
                );


        crosshair
            .append("line")
            .attr(
                "class",
                "ali-crosshair"
            )
            .attr(
                "y1",
                0
            )
            .attr(
                "y2",
                innerHeight
            );


        const overlay =
            chart.append("rect")
                .attr(
                    "class",
                    "ali-hover"
                )
                .attr(
                    "width",
                    innerWidth
                )
                .attr(
                    "height",
                    innerHeight
                )
                .attr(
                    "fill",
                    "transparent"
                );


        overlay
            .on(
                "mousemove",

                function(event) {

                    const [
                        mouseX
                    ] =
                        d3.pointer(
                            event,
                            this
                        );


                    const year =
                        Math.round(
                            x.invert(
                                mouseX
                            )
                        );


                    const nearest =
                        d3.least(
                            countryData,

                            d =>
                                Math.abs(
                                    d.year -
                                    year
                                )
                        );


                    if (!nearest) {
                        return;
                    }


                    crosshair
                        .style(
                            "display",
                            null
                        );


                    crosshair
                        .select("line")
                        .attr(
                            "x1",
                            x(
                                nearest.year
                            )
                        )
                        .attr(
                            "x2",
                            x(
                                nearest.year
                            )
                        );


                    tooltip
                        .style(
                            "display",
                            "block"
                        )
                        .style(
                            "left",
                            `${event.pageX + 15}px`
                        )
                        .style(
                            "top",
                            `${event.pageY - 25}px`
                        )
                        .html(`
                            <strong>
                                ${currentCountry}
                            </strong>

                            <div>
                                ${nearest.year}
                            </div>

                            <div>
                                Female:
                                ${d3.format(".1f")(
                                    nearest.female
                                )}
                            </div>

                            <div>
                                Male:
                                ${d3.format(".1f")(
                                    nearest.male
                                )}
                            </div>
                        `);

                }
            )

            .on(
                "mouseleave",

                () => {

                    crosshair
                        .style(
                            "display",
                            "none"
                        );


                    tooltip
                        .style(
                            "display",
                            "none"
                        );

                }
            );

    }

})();


// ================== ALI CODE ENDS HERE ==================


/* ==================================================
   FIGURE 2 — BUT
   TEAM DUMBBELL + LINKED COUNTRY DETAIL
================================================== */

(function () {
  const DATA_URL = "life_expectancy_gap.csv";
  const MIN_YEAR = 1960;
  const MAX_YEAR = 2019;
  const CHANGE_THRESHOLD = 0.5;
  const ROW_HEIGHT = 23;

  const COLORS = {
    widened: "#c0508a",
    narrowed: "#3f7fb3",
    same: "#8a94a6",
    ink: "#475569",
    female: "#c0508a",
    male: "#3f7fb3"
  };

  const SHORT_NAMES = {
    "Russian Federation": "Russia",
    "Iran, Islamic Rep.": "Iran",
    "Egypt, Arab Rep.": "Egypt",
    "Korea, Rep.": "South Korea",
    "Congo, Dem. Rep.": "DR Congo"
  };

  const countryLabel = name => SHORT_NAMES[name] || name;
  const formatOne = d3.format(".1f");
  const formatSigned = d3.format("+.1f");
  const formatTick = value =>
    value > 0 ? `+${value}` : value < 0 ? `−${Math.abs(value)}` : "0";

  const SORTS = {
    latest: {
      text: `their ${MAX_YEAR} gap`,
      compare: (a, b) => d3.descending(a.latest, b.latest)
    },
    end: {
      text: "the gap in the end year",
      compare: (a, b) => d3.descending(a.end, b.end)
    },
    change: {
      text: "how much their gap changed",
      compare: (a, b) => d3.descending(a.change, b.change)
    },
    population: {
      text: `${MAX_YEAR} population`,
      compare: (a, b) => d3.descending(a.population, b.population)
    },
    name: {
      text: "name (A–Z)",
      compare: (a, b) => d3.ascending(a.name, b.name)
    }
  };

  const STORIES = {
    big: {
      from: 1960,
      to: 2019,
      highlight: [],
      select: "USA"
    },
    russia: {
      from: 1989,
      to: 1994,
      highlight: ["RUS"],
      select: "RUS",
      context:
        "The drop in men’s life expectancy coincides with the upheaval after the Soviet Union’s collapse. The data show the gap, not its causes."
    },
    iran: {
      from: 1979,
      to: 1984,
      highlight: ["IRN"],
      select: "IRN",
      context:
        "This period overlaps with the Iran–Iraq War. The data show the gap, not its causes."
    },
    menfirst: {
      from: 1960,
      to: 2019,
      highlight: ["BGD", "IND", "IRN"],
      select: "BGD"
    }
  };

  d3.csv(DATA_URL, d3.autoType)
    .then(initializeDumbbell)
    .catch(error => {
      console.error("Could not load life_expectancy_gap.csv:", error);
      d3.select("#error").property("hidden", false);
    });

  function initializeDumbbell(data) {
    const featured = data.filter(
      row => row.featured === true || row.featured === "True"
    );

    const seriesByCode = new Map();
    const rowByCodeAndYear = new Map();

    d3.group(featured, row => row.code).forEach((values, code) => {
      values.sort((a, b) => d3.ascending(a.year, b.year));
      seriesByCode.set(code, values);
      rowByCodeAndYear.set(
        code,
        new Map(values.map(row => [row.year, row]))
      );
    });

    const codes = Array.from(seriesByCode.keys());
    const getCountryName = code =>
      countryLabel(seriesByCode.get(code)[0].country);

    const globalMaximumGap = d3.max(data, row => row.gap);
    const xMinimum = Math.floor(d3.min(featured, row => row.gap) - 1);
    const xMaximum = Math.ceil(d3.max(featured, row => row.gap)) + 1;

    const state = {
      from: 1960,
      to: 2019,
      sort: "latest",
      selected: "USA",
      highlight: new Set(),
      story: "big",
      playing: false,
      hover: null
    };

    let animationTimer = null;
    const latestLayout = { value: { width: 960, marginLeft: 118, innerWidth: 778 } };

    const fromInput = d3.select("#from-year");
    const toInput = d3.select("#to-year");
    const fromOutput = d3.select("#from-out");
    const toOutput = d3.select("#to-out");
    const playButton = d3.select("#play");
    const sortSelect = d3.select("#sort");
    const countrySelect = d3.select("#country-select");
    const tooltip = d3.select("#tooltip");

    const sortedCountryCodes = codes
      .slice()
      .sort((a, b) => d3.ascending(getCountryName(a), getCountryName(b)));

    countrySelect
      .selectAll("option")
      .data(sortedCountryCodes)
      .join("option")
      .attr("value", code => code)
      .text(code => getCountryName(code));

    function getRows(fromYear, toYear) {
      return codes
        .map(code => {
          const start = rowByCodeAndYear.get(code).get(fromYear);
          const end = rowByCodeAndYear.get(code).get(toYear);
          const latest = rowByCodeAndYear.get(code).get(MAX_YEAR);
          const change = end.gap - start.gap;

          return {
            code,
            name: getCountryName(code),
            start: start.gap,
            end: end.gap,
            change,
            latest: latest.gap,
            population: latest.population,
            startFemale: start.life_exp_female,
            startMale: start.life_exp_male,
            endFemale: end.life_exp_female,
            endMale: end.life_exp_male,
            kind:
              change > CHANGE_THRESHOLD
                ? "widened"
                : change < -CHANGE_THRESHOLD
                  ? "narrowed"
                  : "same"
          };
        })
        .sort(SORTS[state.sort].compare);
    }

    function writeFigureText(rows) {
      const count = rows.length;
      const womenLonger = rows.filter(row => row.end > 0).length;
      const menLedAtStart = rows.filter(row => row.start < 0).length;
      const lead = state.to === MAX_YEAR ? "Today" : `In ${state.to}`;
      const verb = state.to === MAX_YEAR ? "outlive" : "outlived";
      const numberPhrase = number =>
        number === 1 ? "one of them" : `${number} of them`;

      let title;

      if (womenLonger === count) {
        title = `${lead}, women ${verb} men in all ${count} of the most populous countries`;

        if (state.from < state.to && menLedAtStart > 0) {
          title += ` — in ${state.from}, men lived longer in ${numberPhrase(menLedAtStart)}`;
        }
      } else {
        title =
          `In ${state.to}, women ${verb} men in ${womenLonger} of the ${count} most populous countries; ` +
          `men lived longer in ${count - womenLonger}`;
      }

      d3.select("#f1-title").text(title);

      d3.select("#f1-subtitle")
        .style("white-space", "pre-line")
        .text(
          `Each row is one of the ${count} most populous countries (by ${MAX_YEAR} population). ` +
          `The dots show the female-minus-male life-expectancy gap in ${state.from} ` +
          `(open bubbles) and ${state.to} (filled bubbles).\n` +
          `Regional and income-group aggregates were removed.\n` +
          `Rows are sorted by ${SORTS[state.sort].text}.`
        );

      const widened = rows.filter(row => row.kind === "widened").length;
      const narrowed = rows.filter(row => row.kind === "narrowed").length;

      d3.select("#f1-note").text(
        state.from === state.to
          ? `Both dots show ${state.to}, so no change is drawn. Source: World Bank life expectancy at birth by sex.`
          : `From ${state.from} to ${state.to}, the gap widened by more than ${CHANGE_THRESHOLD} years in ${widened} countries, ` +
            `narrowed in ${narrowed}, and changed little in ${count - widened - narrowed}. ` +
            `Source: World Bank life expectancy at birth by sex.`
      );
    }

    function crossingYear(code) {
      const values = seriesByCode.get(code);
      const lastNonPositive = d3.max(
        values.filter(row => row.gap <= 0),
        row => row.year
      );

      return lastNonPositive === undefined ? MIN_YEAR : lastNonPositive + 1;
    }

    function writeStory(rows) {
      const storyBox = d3.select("#story-text");
      const key = state.story;

      if (!key) {
        storyBox.html("");
        return;
      }

      const story = STORIES[key];
      let html = "";

      if (key === "big") {
        const widened = rows.filter(row => row.kind === "widened").length;
        const narrowed = rows.filter(row => row.kind === "narrowed").length;

        html =
          `Between ${state.from} and ${state.to}, the gap <strong>widened</strong> in ${widened} of ${rows.length} countries, ` +
          `<strong>narrowed</strong> in ${narrowed}, and barely moved in ${rows.length - widened - narrowed}. ` +
          `Try <em>Play</em>, or sort by “Change in the gap”.`;
      } else {
        const highlightedRows = rows.filter(row =>
          state.highlight.has(row.code)
        );

        if (highlightedRows.length === 1) {
          const row = highlightedRows[0];

          html =
            `<strong>${row.name}</strong>: the gap went from ` +
            `<strong>${formatSigned(row.start)}</strong> years in ${state.from} to ` +
            `<strong>${formatSigned(row.end)}</strong> in ${state.to}. ` +
            `Men’s life expectancy moved ${formatOne(row.startMale)} → ${formatOne(row.endMale)}; ` +
            `women’s ${formatOne(row.startFemale)} → ${formatOne(row.endFemale)}.`;

          if (row.end === globalMaximumGap) {
            html += " That is the largest gap of any country in any year in this dataset.";
          }
        } else {
          html =
            highlightedRows
              .map(
                row =>
                  `<strong>${row.name}</strong> ${formatSigned(row.start)} → ${formatSigned(row.end)}`
              )
              .join(" · ") +
            ` years (${state.from} → ${state.to}). Women moved permanently ahead in ` +
            highlightedRows
              .map(row => `${row.name} in ${crossingYear(row.code)}`)
              .join(", ")
              .replace(/, ([^,]*)$/, ", and $1") +
            ".";
        }

        if (
          story.context &&
          state.from === story.from &&
          state.to === story.to
        ) {
          html += ` <span class="muted">${story.context}</span>`;
        }
      }

      storyBox.html(html);
    }

    function buildLegend() {
      const legend = d3.select("#legend").html("");

      function addItem(text, draw, className) {
        const item = legend.append("span").attr("class", "legend-item");
        const icon = item.append("svg").attr("width", 34).attr("height", 16);
        draw(icon);
        item.append("span").attr("class", className || null).text(text);
      }

      addItem(
        "",
        icon =>
          icon
            .append("circle")
            .attr("cx", 17)
            .attr("cy", 8)
            .attr("r", 5)
            .attr("fill", "#fff")
            .attr("stroke", COLORS.ink)
            .attr("stroke-width", 1.8),
        "lg-from"
      );

      addItem(
        "",
        icon =>
          icon
            .append("circle")
            .attr("cx", 17)
            .attr("cy", 8)
            .attr("r", 5)
            .attr("fill", COLORS.ink),
        "lg-to"
      );

      [
        ["widened", "Gap widened (women living longer)"],
        ["narrowed", "Gap narrowed (men catching up)"],
        ["same", `About the same (±${CHANGE_THRESHOLD} yr)`]
      ].forEach(([key, text]) =>
        addItem(text, icon =>
          icon
            .append("line")
            .attr("x1", 0)
            .attr("x2", 34)
            .attr("y1", 8)
            .attr("y2", 8)
            .attr("stroke", COLORS[key])
            .attr("stroke-width", 3)
            .attr("stroke-linecap", "round")
        )
      );
    }

    buildLegend();

    const margin = { top: 54, right: 40, bottom: 56, left: 118 };

    function getChartWidth() {
      return Math.max(
        300,
        Math.min(
          960,
          Math.round(document.querySelector("#chart").clientWidth || 960)
        )
      );
    }

    const svg = d3.select("#chart").append("svg").attr("role", "group");
    const chart = svg.append("g");

    const layers = {
      zones: chart.append("g"),
      bands: chart.append("g"),
      grid: chart.append("g").attr("class", "grid-x"),
      zero: chart.append("g"),
      rows: chart.append("g"),
      notes: chart.append("g"),
      axis: chart.append("g").attr("class", "axis")
    };

    function getLayout() {
      const width = getChartWidth();
      const marginLeft = width < 560 ? 92 : margin.left;
      const innerWidth = width - marginLeft - margin.right;
      const innerHeight = codes.length * ROW_HEIGHT;
      const x = d3
        .scaleLinear()
        .domain([xMinimum, xMaximum])
        .range([0, innerWidth]);

      return {
        width,
        marginLeft,
        innerWidth,
        innerHeight,
        height: margin.top + innerHeight + margin.bottom,
        x,
        wide: width >= 760
      };
    }

    function drawFrame(layout) {
      svg
        .attr("viewBox", `0 0 ${layout.width} ${layout.height}`)
        .attr(
          "aria-label",
          `Dumbbell chart showing the female-minus-male life-expectancy gap for ${codes.length} populous countries`
        );

      chart.attr(
        "transform",
        `translate(${layout.marginLeft},${margin.top})`
      );

      layers.zones
        .selectAll("rect")
        .data([
          { x: 0, width: layout.x(0), fill: "#edf4fa" },
          {
            x: layout.x(0),
            width: layout.innerWidth - layout.x(0),
            fill: "#fdf6fa"
          }
        ])
        .join("rect")
        .attr("x", row => row.x)
        .attr("y", 0)
        .attr("width", row => row.width)
        .attr("height", layout.innerHeight)
        .attr("fill", row => row.fill);

      layers.bands
        .selectAll("rect")
        .data(d3.range(0, codes.length, 2))
        .join("rect")
        .attr("class", "row-band")
        .attr("x", 0)
        .attr("width", layout.innerWidth)
        .attr("y", index => index * ROW_HEIGHT)
        .attr("height", ROW_HEIGHT)
        .attr("fill", "#0f172a")
        .attr("fill-opacity", 0.025);

      const tickCount = layout.innerWidth < 420 ? 6 : 10;

      layers.grid
        .attr("transform", `translate(0,${layout.innerHeight})`)
        .call(
          d3
            .axisBottom(layout.x)
            .ticks(tickCount)
            .tickSize(-layout.innerHeight)
            .tickFormat("")
        );

      layers.axis
        .attr("transform", `translate(0,${layout.innerHeight})`)
        .call(d3.axisBottom(layout.x).ticks(tickCount).tickFormat(formatTick));

      layers.axis
        .selectAll(".axis-label")
        .data([0])
        .join("text")
        .attr("class", "axis-label")
        .attr("x", layout.innerWidth / 2)
        .attr("y", 44)
        .attr("text-anchor", "middle")
        .text("Female − male life expectancy at birth (years)");

      layers.zero
        .selectAll("line")
        .data([0])
        .join("line")
        .attr("class", "zero-line")
        .attr("x1", layout.x(0))
        .attr("x2", layout.x(0))
        .attr("y1", -8)
        .attr("y2", layout.innerHeight);

      layers.zero
        .selectAll("text")
        .data([
          {
            text: "◄ Men live longer",
            className: "m",
            offset: -8,
            anchor: "end"
          },
          {
            text: "Women live longer ►",
            className: "f",
            offset: 8,
            anchor: "start"
          }
        ])
        .join("text")
        .attr("class", row => `zone-label ${row.className}`)
        .attr("x", row => layout.x(0) + row.offset)
        .attr("y", -16)
        .attr("text-anchor", row => row.anchor)
        .text(row => row.text);
    }

    function showTooltip(event, row) {
      const population =
        row.population >= 1e9
          ? `${d3.format(".2f")(row.population / 1e9)} billion`
          : `${d3.format(".0f")(row.population / 1e6)} million`;

      function tooltipRow(label, value) {
        return `<div class="row"><span>${label}</span><span>${value}</span></div>`;
      }

      tooltip
        .html(
          `<strong>${row.name}</strong>` +
            `<div class="tip-h">${state.from}</div>` +
            tooltipRow(
              "Women / men",
              `${formatOne(row.startFemale)} / ${formatOne(row.startMale)} yrs`
            ) +
            tooltipRow("Gap", `${formatSigned(row.start)} yrs`) +
            (state.from !== state.to
              ? `<div class="tip-h">${state.to}</div>` +
                tooltipRow(
                  "Women / men",
                  `${formatOne(row.endFemale)} / ${formatOne(row.endMale)} yrs`
                ) +
                tooltipRow("Gap", `${formatSigned(row.end)} yrs`) +
                tooltipRow("Change", `${formatSigned(row.change)} yrs`)
              : "") +
            `<div class="tip-h">${MAX_YEAR} population</div>` +
            tooltipRow("People", population) +
            `<div class="tip-foot">Click to zoom in below</div>`
        )
        .style("opacity", 1)
        .attr("aria-hidden", "false");

      placeTooltip(event.currentTarget);
    }

    function placeTooltip(rowElement) {
      const node = tooltip.node();
      const tooltipWidth = node.offsetWidth;
      const tooltipHeight = node.offsetHeight;
      const svgRectangle = svg.node().getBoundingClientRect();
      const rowRectangle = rowElement.getBoundingClientRect();
      const layout = latestLayout.value;
      const scale = svgRectangle.width / layout.width;
      const plotRight =
        svgRectangle.left +
        scale * (layout.marginLeft + layout.innerWidth);

      const left = Math.max(8, plotRight - tooltipWidth) + window.scrollX;
      let top = rowRectangle.top + window.scrollY - 4;
      const chartTop = svgRectangle.top + window.scrollY;
      const chartBottom = svgRectangle.bottom + window.scrollY;

      top = Math.min(
        top,
        chartBottom - scale * margin.bottom - tooltipHeight
      );
      top = Math.max(top, chartTop);

      tooltip.style("left", `${left}px`).style("top", `${top}px`);
    }

    function hideTooltip() {
      tooltip.style("opacity", 0).attr("aria-hidden", "true");
    }

    function drawRows(rows, layout, duration) {
      const ease = state.playing ? d3.easeLinear : d3.easeCubicInOut;
      const transition = selection =>
        duration > 0
          ? selection.transition().duration(duration).ease(ease)
          : selection;

      const yPosition = index => index * ROW_HEIGHT;
      const midpoint = ROW_HEIGHT / 2;
      const order = new Map(
        rows.map((row, index) => [row.code, index])
      );

      const rowSelection = layers.rows
        .selectAll("g.row")
        .data(rows, row => row.code)
        .join(enter => {
          const group = enter
            .append("g")
            .attr("class", "row")
            .attr("data-code", row => row.code)
            .attr(
              "transform",
              row => `translate(0,${yPosition(order.get(row.code))})`
            );

          group.append("rect").attr("class", "row-bg");
          group.append("line").attr("class", "link");
          group.append("circle").attr("class", "dot start").attr("r", 5.2);
          group.append("circle").attr("class", "dot end").attr("r", 5.6);
          group.append("text").attr("class", "country-label");
          group
            .append("rect")
            .attr("class", "hit")
            .attr("tabindex", 0)
            .attr("role", "button");

          return group;
        });

      rowSelection
        .classed("is-story", row => state.highlight.has(row.code))
        .classed("is-selected", row => row.code === state.selected);

      svg.classed("focus-mode", state.highlight.size > 0);

      transition(rowSelection).attr(
        "transform",
        row => `translate(0,${yPosition(order.get(row.code))})`
      );

      rowSelection
        .select(".row-bg")
        .attr("x", -layout.marginLeft)
        .attr("width", layout.width)
        .attr("y", 0)
        .attr("height", ROW_HEIGHT);

      rowSelection
        .select(".hit")
        .attr("x", -layout.marginLeft)
        .attr("width", layout.width)
        .attr("y", 0)
        .attr("height", ROW_HEIGHT)
        .attr(
          "aria-label",
          row =>
            `${row.name}: gap ${formatSigned(row.start)} in ${state.from}, ` +
            `${formatSigned(row.end)} in ${state.to}. Press Enter to zoom in.`
        );

      transition(rowSelection.select(".link"))
        .attr("x1", row => layout.x(row.start))
        .attr("x2", row => layout.x(row.end))
        .attr("y1", midpoint)
        .attr("y2", midpoint)
        .attr("stroke", row => COLORS[row.kind]);

      transition(rowSelection.select(".dot.start"))
        .attr("cx", row => layout.x(row.start))
        .attr("cy", midpoint);

      transition(rowSelection.select(".dot.end"))
        .attr("cx", row => layout.x(row.end))
        .attr("cy", midpoint)
        .attr("fill", row => COLORS[row.kind]);

      rowSelection
        .select(".country-label")
        .attr("x", -10)
        .attr("y", midpoint)
        .attr("dy", "0.34em")
        .text(row => row.name);

      rowSelection
        .on("mouseenter", (event, row) => {
          state.hover = row.code;
          svg.classed("hovering", true);
          markHover();
          showTooltip(event, row);
        })
        .on("mouseleave", () => {
          state.hover = null;
          svg.classed("hovering", false);
          markHover();
          hideTooltip();
        })
        .on("click", (event, row) => selectCountry(row.code));

      rowSelection.select(".hit").on("keydown", (event, row) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectCountry(row.code);
        }
      });

      markHover();

      return { order, yPosition };
    }

    function markHover() {
      layers.rows
        .selectAll("g.row")
        .classed("is-hover", row => row.code === state.hover);
    }

    function drawNotes(rows, layout, positions) {
      const notes = [];

      if (!state.playing && layout.wide && rows.length) {
        const alreadyAdded = row => notes.some(note => note.row === row);

        if (state.highlight.size) {
          rows
            .filter(row => state.highlight.has(row.code))
            .forEach(row =>
              notes.push({
                row,
                lead: `${row.name}: `,
                rest: `${formatSigned(row.start)} → ${formatSigned(row.end)} yrs`,
                short: `${formatSigned(row.start)} → ${formatSigned(row.end)}`
              })
            );
        } else {
          const largest = d3.greatest(rows, row => row.end);
          notes.push({
            row: largest,
            lead: `Largest gap in ${state.to}:`,
            rest: ` ${formatSigned(largest.end)} yrs`,
            short: `${formatSigned(largest.end)} yrs`
          });

          if (state.from !== state.to) {
            const widest = d3.greatest(rows, row => row.change);
            const narrowest = d3.least(rows, row => row.change);

            if (!alreadyAdded(widest)) {
              notes.push({
                row: widest,
                lead: `Biggest widening: ${formatSigned(widest.change)} yrs`,
                rest: widest.start < 0 ? ` (men led in ${state.from})` : "",
                short: `${formatSigned(widest.change)} yrs`
              });
            }

            if (
              narrowest.change < -CHANGE_THRESHOLD &&
              !alreadyAdded(narrowest)
            ) {
              notes.push({
                row: narrowest,
                lead: `Biggest narrowing: ${formatSigned(narrowest.change)} yrs`,
                rest: "",
                short: `${formatSigned(narrowest.change)} yrs`
              });
            }
          }
        }
      }

      const groups = layers.notes
        .selectAll("g.note")
        .data(notes, note => note.row.code)
        .join(enter => {
          const group = enter
            .append("g")
            .attr("class", "note annotation");
          group.append("line").attr("class", "annotation-line");
          const text = group.append("text");
          text.append("tspan").attr("class", "lead").attr("font-weight", 700);
          text.append("tspan").attr("class", "rest");
          return group;
        });

      groups.each(function (note) {
        const selection = d3.select(this);
        const centerY =
          positions.yPosition(positions.order.get(note.row.code)) +
          ROW_HEIGHT / 2;
        const right = Math.max(
          layout.x(note.row.start),
          layout.x(note.row.end)
        );
        const limit = layout.innerWidth + margin.right - 4;
        const text = selection
          .select("text")
          .attr("y", centerY)
          .attr("dy", "0.34em");

        function textWidth(lead, rest) {
          selection.select(".lead").text(lead);
          selection.select(".rest").text(rest);
          return text.node().getComputedTextLength
            ? text.node().getComputedTextLength()
            : 150;
        }

        let lead = note.lead;
        let rest = note.rest;
        let width = textWidth(lead, rest);

        if (right + 19 + width > limit && note.short) {
          lead = "";
          rest = note.short;
          width = textWidth(lead, rest);
        }

        const x =
          right + 19 + width <= limit
            ? right + 19
            : Math.max(right + 19, limit - width);

        text.attr("x", x).attr("text-anchor", "start");

        selection
          .select("line")
          .attr("x1", right + 8)
          .attr("x2", Math.min(right + 15, x - 3))
          .attr("y1", centerY)
          .attr("y2", centerY);
      });
    }

    /* Linked country-detail chart */
    const detailMargin = { top: 22, right: 70, bottom: 36, left: 46 };
    const detailHeight = 290;

    function getDetailWidth() {
      return Math.max(
        300,
        Math.min(
          960,
          Math.round(
            document.querySelector("#detail-chart").clientWidth || 960
          )
        )
      );
    }

    const detailSvg = d3
      .select("#detail-chart")
      .append("svg")
      .attr("role", "group");
    const detailChart = detailSvg.append("g");

    const detailLayers = {
      grid: detailChart.append("g").attr("class", "grid-x"),
      area: detailChart.append("path").attr("class", "gap-area"),
      axisX: detailChart.append("g").attr("class", "axis"),
      axisY: detailChart.append("g").attr("class", "axis"),
      femaleLine: detailChart.append("path").attr("class", "line-f"),
      maleLine: detailChart.append("path").attr("class", "line-m"),
      marks: detailChart.append("g"),
      crosshair: detailChart.append("g").attr("class", "crosshair"),
      yLabel: detailChart.append("text").attr("class", "axis-label"),
      overlay: detailChart.append("rect").attr("class", "overlay")
    };

    const detailY = d3.scaleLinear().domain([30, 90]);
    let detailX;
    let detailInnerWidth;
    let detailInnerHeight;

    function drawDetail() {
      const width = getDetailWidth();
      detailInnerWidth = width - detailMargin.left - detailMargin.right;
      detailInnerHeight =
        detailHeight - detailMargin.top - detailMargin.bottom;

      detailX = d3
        .scaleLinear()
        .domain([MIN_YEAR, MAX_YEAR])
        .range([0, detailInnerWidth]);
      detailY.range([detailInnerHeight, 0]);

      detailSvg.attr("viewBox", `0 0 ${width} ${detailHeight}`);
      detailChart.attr(
        "transform",
        `translate(${detailMargin.left},${detailMargin.top})`
      );

      const countrySeries = seriesByCode.get(state.selected);
      const name = getCountryName(state.selected);

      detailSvg.attr(
        "aria-label",
        `Line chart of female and male life expectancy in ${name}, ${MIN_YEAR} to ${MAX_YEAR}`
      );

      detailLayers.grid.call(
        d3
          .axisLeft(detailY)
          .ticks(6)
          .tickSize(-detailInnerWidth)
          .tickFormat("")
      );

      detailLayers.axisX
        .attr("transform", `translate(0,${detailInnerHeight})`)
        .call(
          d3
            .axisBottom(detailX)
            .ticks(width < 560 ? 5 : 10)
            .tickFormat(d3.format("d"))
        );

      detailLayers.axisY.call(d3.axisLeft(detailY).ticks(6));

      detailLayers.yLabel
        .attr("transform", "rotate(-90)")
        .attr("x", -detailInnerHeight / 2)
        .attr("y", -detailMargin.left + 12)
        .attr("text-anchor", "middle")
        .text("Life expectancy at birth (years)");

      const femaleLine = d3
        .line()
        .x(row => detailX(row.year))
        .y(row => detailY(row.life_exp_female));

      const maleLine = d3
        .line()
        .x(row => detailX(row.year))
        .y(row => detailY(row.life_exp_male));

      detailLayers.area.attr(
        "d",
        d3
          .area()
          .x(row => detailX(row.year))
          .y0(row => detailY(row.life_exp_male))
          .y1(row => detailY(row.life_exp_female))(countrySeries)
      );

      detailLayers.femaleLine.attr("d", femaleLine(countrySeries));
      detailLayers.maleLine.attr("d", maleLine(countrySeries));

      const last = countrySeries[countrySeries.length - 1];
      let femaleY = detailY(last.life_exp_female);
      let maleY = detailY(last.life_exp_male);

      if (Math.abs(femaleY - maleY) < 15) {
        const middle = (femaleY + maleY) / 2;
        const direction = femaleY < maleY ? -1 : 1;
        femaleY = middle + direction * 7.5;
        maleY = middle - direction * 7.5;
      }

      detailLayers.marks
        .selectAll("text.end-label")
        .data([
          { text: "Women", y: femaleY, color: COLORS.female },
          { text: "Men", y: maleY, color: COLORS.male }
        ])
        .join("text")
        .attr("class", "end-label")
        .attr("x", detailInnerWidth + 8)
        .attr("y", row => row.y)
        .attr("dy", "0.34em")
        .attr("fill", row => row.color)
        .text(row => row.text);

      detailLayers.overlay
        .attr("width", detailInnerWidth)
        .attr("height", detailInnerHeight);

      drawDetailMarks();
    }

    function drawDetailMarks() {
      const getRow = year =>
        rowByCodeAndYear.get(state.selected).get(year);

      const selectedYears = [
        { year: state.from, className: "from" },
        ...(state.to !== state.from
          ? [{ year: state.to, className: "to" }]
          : [])
      ];

      detailLayers.marks
        .selectAll("line.year-mark")
        .data(selectedYears, row => row.className)
        .join("line")
        .attr("class", row => `year-mark ${row.className}`)
        .attr("x1", row => detailX(row.year))
        .attr("x2", row => detailX(row.year))
        .attr("y1", 0)
        .attr("y2", detailInnerHeight);

      detailLayers.marks
        .selectAll("text.year-mark-label")
        .data(selectedYears, row => row.className)
        .join("text")
        .attr("class", "year-mark-label")
        .attr("y", -7)
        .attr("text-anchor", "middle")
        .attr("x", row => detailX(row.year))
        .text(row => row.year);

      const dots = selectedYears.flatMap(selected => {
        const row = getRow(selected.year);
        return [
          {
            key: `${selected.className}-female`,
            x: detailX(selected.year),
            y: detailY(row.life_exp_female),
            color: COLORS.female,
            open: selected.className === "from"
          },
          {
            key: `${selected.className}-male`,
            x: detailX(selected.year),
            y: detailY(row.life_exp_male),
            color: COLORS.male,
            open: selected.className === "from"
          }
        ];
      });

      detailLayers.marks
        .selectAll("circle.mark-dot")
        .data(dots, row => row.key)
        .join("circle")
        .attr("class", "mark-dot")
        .attr("r", 5)
        .attr("cx", row => row.x)
        .attr("cy", row => row.y)
        .attr("stroke", row => row.color)
        .attr("stroke-width", 2)
        .attr("fill", row => (row.open ? "#fff" : row.color));

      const start = getRow(state.from);
      const end = getRow(state.to);
      const name = getCountryName(state.selected);

      d3.select("#detail-title").text(`Explore Further: ${name}`);

      d3.select("#detail-sub").html(
        state.from === state.to
          ? `In <strong>${state.to}</strong>, women lived ` +
              `<strong>${formatOne(end.life_exp_female)}</strong> years and men ` +
              `<strong>${formatOne(end.life_exp_male)}</strong> — a gap of ` +
              `<strong>${formatSigned(end.gap)}</strong> years.`
          : `In <strong>${state.from}</strong>, the gap was ` +
              `<strong>${formatSigned(start.gap)}</strong> years; in ` +
              `<strong>${state.to}</strong>, it was ` +
              `<strong>${formatSigned(end.gap)}</strong> ` +
              `(women ${formatOne(end.life_exp_female)}, men ${formatOne(end.life_exp_male)}). ` +
              `The shaded band is the gap.`
      );

      countrySelect.property("value", state.selected);
    }

    function yearFromPointer(event) {
      const [xValue] = d3.pointer(event, detailLayers.overlay.node());
      return Math.max(
        MIN_YEAR,
        Math.min(MAX_YEAR, Math.round(detailX.invert(xValue)))
      );
    }

    function showCrosshair(year) {
      const row = rowByCodeAndYear.get(state.selected).get(year);
      detailLayers.crosshair.html("");

      detailLayers.crosshair
        .append("line")
        .attr("x1", detailX(year))
        .attr("x2", detailX(year))
        .attr("y1", 0)
        .attr("y2", detailInnerHeight);

      [
        [row.life_exp_female, COLORS.female, "Women"],
        [row.life_exp_male, COLORS.male, "Men"]
      ]
        .sort((a, b) => d3.descending(a[0], b[0]))
        .forEach(([value, color, label], index) => {
          detailLayers.crosshair
            .append("circle")
            .attr("cx", detailX(year))
            .attr("cy", detailY(value))
            .attr("r", 4)
            .attr("fill", color);

          const flip = detailX(year) > detailInnerWidth - 120;

          detailLayers.crosshair
            .append("text")
            .attr("class", "halo")
            .attr("x", detailX(year) + (flip ? -9 : 9))
            .attr("y", detailY(value) + (index === 0 ? -9 : 15))
            .attr("text-anchor", flip ? "end" : "start")
            .text(`${year}: ${label} ${formatOne(value)}`);
        });
    }

    detailLayers.overlay
      .on("pointermove", event => {
        const year = yearFromPointer(event);
        showCrosshair(year);

        if (event.buttons === 1) {
          setEndYear(year, 90);
        }
      })
      .on("pointerleave", () => detailLayers.crosshair.html(""))
      .on("pointerdown", event => {
        if (event.target.setPointerCapture) {
          event.target.setPointerCapture(event.pointerId);
        }
        setEndYear(yearFromPointer(event), 90);
      });

    function render(duration) {
      const rows = getRows(state.from, state.to);
      const layout = getLayout();
      latestLayout.value = layout;

      drawFrame(layout);
      const positions = drawRows(rows, layout, duration);
      drawNotes(rows, layout, positions);
      writeFigureText(rows);
      writeStory(rows);

      d3.select(".lg-from").text(state.from);
      d3.select(".lg-to").text(state.to);

      fromInput.property("value", state.from);
      toInput.property("value", state.to);
      fromOutput.text(state.from);
      toOutput.text(state.to);
      sortSelect.property("value", state.sort);

      d3.selectAll(".stories .chip")
        .classed("active", function () {
          return this.dataset.story === state.story;
        })
        .attr("aria-pressed", function () {
          return String(this.dataset.story === state.story);
        });

      drawDetailMarks();
    }

    function selectCountry(code) {
      state.selected = code;
      drawDetail();
      render(0);

      const detail = d3
        .select("#detail-chart")
        .node()
        .closest(".detail");

      detail.classList.add("flash");
      setTimeout(() => d3.select(".detail").classed("flash", false), 700);
    }

    function setEndYear(year, duration) {
      stopPlay();
      state.to = Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));

      if (state.to < state.from) {
        state.from = state.to;
      }

      render(duration === undefined ? 150 : duration);
    }

    fromInput.on("input", function () {
      stopPlay();
      state.from = +this.value;

      if (state.from > state.to) {
        state.to = state.from;
      }

      render(120);
    });

    toInput.on("input", function () {
      setEndYear(+this.value, 120);
    });

    sortSelect.on("change", function () {
      state.sort = this.value;
      render(700);
    });

    countrySelect.on("change", function () {
      selectCountry(this.value);
    });

    function startPlay() {
      if (state.to >= MAX_YEAR) {
        state.to = state.from;
      }

      state.playing = true;
      playButton.text("❚❚ Pause").attr("aria-pressed", "true");
      d3.select("#story-text").attr("aria-live", "off");
      render(0);

      animationTimer = d3.interval(() => {
        if (state.to >= MAX_YEAR) {
          stopPlay();
          return;
        }

        state.to += 1;
        render(380);

        if (state.to >= MAX_YEAR) {
          stopPlay();
        }
      }, 420);
    }

    function stopPlay() {
      const wasPlaying = state.playing;
      state.playing = false;

      if (animationTimer) {
        animationTimer.stop();
        animationTimer = null;
      }

      playButton.text("▶ Play").attr("aria-pressed", "false");
      d3.select("#story-text").attr("aria-live", "polite");

      if (wasPlaying) {
        render(0);
      }
    }

    playButton.on("click", () => {
      state.playing ? stopPlay() : startPlay();
    });

    d3.selectAll(".stories .chip").on("click", function () {
      const key = this.dataset.story;
      const story = STORIES[key];

      stopPlay();
      state.story = key;
      state.from = story.from;
      state.to = story.to;
      state.highlight = new Set(story.highlight);
      state.selected = story.select;

      drawDetail();
      render(900);
    });

    let resizeTimer;

    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        drawDetail();
        render(0);
      }, 120);
    });

    drawDetail();
    render(0);

    window.figure1 = {
      state,
      render,
      getRows,
      seriesByCode
    };
  }
})();


/* ==================================================
   FIGURE 3 — THEREFORE
   DENNISE: WHO MAKES IT TO 65?
================================================== */

(function () {
  const MIN_YEAR = 1960;
  const MAX_YEAR = 2019;
  const DROP_AGGREGATES = true;

  const DATA_PATHS = [
    "team_members/survival_65_fp.csv",
    "team_members/survival_65.csv",
    "survival_65.csv"
  ];

  const AGGREGATES = new Set([
    "AFE", "AFW", "ARB", "CEB", "CSS", "EAP", "EAR", "EAS",
    "ECA", "ECS", "EMU", "EUU", "FCS", "HIC", "HPC", "IBD",
    "IBT", "IDA", "IDB", "IDX", "INX", "LAC", "LCN", "LDC",
    "LIC", "LMC", "LMY", "LTE", "MEA", "MIC", "MNA", "NAC",
    "OED", "OSS", "PRE", "PSS", "PST", "SAS", "SSA", "SSF",
    "SST", "TEA", "TEC", "TLA", "TMN", "TSA", "TSS", "UMC",
    "WLD"
  ]);

  const SHORT_NAMES = {
    "Russian Federation": "Russia",
    "Iran, Islamic Rep.": "Iran",
    "Egypt, Arab Rep.": "Egypt",
    "Korea, Rep.": "South Korea",
    "Korea, Dem. People's Rep.": "North Korea",
    "Congo, Dem. Rep.": "DR Congo",
    "Congo, Rep.": "Congo",
    "Syrian Arab Republic": "Syria",
    "Venezuela, RB": "Venezuela",
    "Yemen, Rep.": "Yemen",
    "Gambia, The": "Gambia",
    "Bahamas, The": "Bahamas",
    "Lao PDR": "Laos",
    "Kyrgyz Republic": "Kyrgyzstan",
    "Slovak Republic": "Slovakia",
    "Turkiye": "Turkey",
    "Hong Kong SAR, China": "Hong Kong",
    "Macao SAR, China": "Macao",
    "Micronesia, Fed. Sts.": "Micronesia",
    "St. Lucia": "Saint Lucia"
  };

  const tidyName = name => SHORT_NAMES[name] || name;
  const formatOne = d3.format(".1f");
  const formatSigned = d3.format("+.1f");
  const tooltip = d3.select("#tooltip");

  loadFirst(DATA_PATHS)
    .then(data => {
      const keepCountry = row =>
        !(DROP_AGGREGATES && AGGREGATES.has(row.code));

      const survivalRows = data
        .map(row => ({
          code: row["Country Code"],
          name: row["Country Name"],
          year: +row.Year,
          female: +row.female_survival_65,
          male: +row.male_survival_65
        }))
        .filter(
          row =>
            keepCountry(row) &&
            [row.year, row.female, row.male].every(Number.isFinite)
        )
        .map(row => ({
          ...row,
          gap: row.female - row.male
        }));

      buildSurvivalFigure(survivalRows);
    })
    .catch(error => {
      console.error("Could not load the survival-to-65 data:", error);
      d3.selectAll(".team-error").property("hidden", false);
    });

  function loadFirst(paths) {
    return paths
      .slice(1)
      .reduce(
        (promise, path) => promise.catch(() => d3.csv(path)),
        d3.csv(paths[0])
      );
  }

  function showTooltip(event, html) {
    tooltip
      .html(html)
      .style("opacity", 1)
      .attr("aria-hidden", "false");

    const node = tooltip.node();
    const width = node.offsetWidth;
    const height = node.offsetHeight;
    const maximumX =
      window.scrollX + document.documentElement.clientWidth - 8;

    let left = event.pageX + 16;
    if (left + width > maximumX) {
      left = event.pageX - width - 16;
    }

    let top = event.pageY - height - 14;
    if (top < window.scrollY + 8) {
      top = event.pageY + 18;
    }

    tooltip
      .style("left", `${Math.max(8, left)}px`)
      .style("top", `${top}px`);
  }

  function hideTooltip() {
    tooltip.style("opacity", 0).attr("aria-hidden", "true");
  }

  function tooltipRow(label, value) {
    return `<div class="row"><span>${label}</span><span>${value}</span></div>`;
  }

  function getChartSize(selector, wideRatio, narrowRatio) {
    const width = Math.max(
      300,
      Math.min(
        900,
        Math.round(document.querySelector(selector).clientWidth || 800)
      )
    );

    const small = width < 560;
    const margins = small
      ? { top: 16, right: 14, bottom: 52, left: 48 }
      : { top: 18, right: 26, bottom: 56, left: 62 };

    const height = Math.round(width * (small ? narrowRatio : wideRatio));

    return {
      width,
      height,
      small,
      marginLeft: margins.left,
      marginTop: margins.top,
      innerWidth: width - margins.left - margins.right,
      innerHeight: height - margins.top - margins.bottom
    };
  }

  function drawAxes(layers, layout, options) {
    layers.grid.html("");
    layers.axis.html("");

    const xTicks = layout.small ? 5 : 8;
    const yTicks = options.yTicks || 7;

    layers.grid
      .append("g")
      .attr("class", "grid-x")
      .call(
        d3
          .axisLeft(layout.y)
          .ticks(yTicks)
          .tickSize(-layout.innerWidth)
          .tickFormat("")
      );

    layers.grid
      .append("g")
      .attr("class", "grid-x")
      .attr("transform", `translate(0,${layout.innerHeight})`)
      .call(
        d3
          .axisBottom(layout.x)
          .ticks(xTicks)
          .tickSize(-layout.innerHeight)
          .tickFormat("")
      );

    layers.axis
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${layout.innerHeight})`)
      .call(
        d3
          .axisBottom(layout.x)
          .ticks(xTicks)
          .tickFormat(options.xFormat || null)
      );

    layers.axis
      .append("g")
      .attr("class", "axis")
      .call(
        d3
          .axisLeft(layout.y)
          .ticks(yTicks)
          .tickFormat(options.yFormat || null)
      );

    layers.axis
      .append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("x", layout.innerWidth / 2)
      .attr("y", layout.innerHeight + 42)
      .text(layout.small ? options.xShort : options.xLabel);

    layers.axis
      .append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -layout.innerHeight / 2)
      .attr("y", -layout.marginLeft + 14)
      .text(layout.small ? options.yShort : options.yLabel);
  }

  function createYearControl(prefix, onChange) {
    const input = d3.select(`#${prefix}-year`);
    const output = d3.select(`#${prefix}-year-out`);
    const button = d3.select(`#${prefix}-play`);

    let year = MAX_YEAR;
    let timer = null;

    function set(selectedYear, duration) {
      year = selectedYear;
      input.property("value", selectedYear);
      output.text(selectedYear);
      onChange(selectedYear, duration);
    }

    function stop() {
      if (timer) {
        timer.stop();
        timer = null;
      }

      button.text("▶ Play").attr("aria-pressed", "false");
    }

    input.on("input", function () {
      stop();
      set(+this.value, 350);
    });

    button.on("click", () => {
      if (timer) {
        stop();
        return;
      }

      if (year >= MAX_YEAR) {
        set(MIN_YEAR, 0);
      }

      button.text("❚❚ Pause").attr("aria-pressed", "true");

      timer = d3.interval(() => {
        if (year >= MAX_YEAR) {
          stop();
          return;
        }

        set(year + 1, 560);

        if (year >= MAX_YEAR) {
          stop();
        }
      }, 620);
    });

    return {
      get: () => year,
      set,
      stop
    };
  }

  let resizeTimer;

  function runOnResize(callback) {
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(callback, 150);
    });
  }

  function buildSurvivalFigure(rows) {
    const rowsByYear = d3.group(rows, row => row.year);

    const minimum = d3.min(rows, row =>
      Math.min(row.female, row.male)
    );
    const maximum = d3.max(rows, row =>
      Math.max(row.female, row.male)
    );

    const sharedDomain = [
      Math.max(0, minimum - 2),
      Math.min(100, maximum + 2)
    ];

    const gapExtent = d3.extent(rows, row => row.gap);
    const color = d3
      .scaleSequential(d3.interpolateViridis)
      .domain(gapExtent);

    let threshold = 0;
    let layout = null;

    const thresholdInput = d3.select("#f3-min");
    thresholdInput.attr("max", Math.floor(gapExtent[1]));
    const thresholdOutput = d3.select("#f3-min-out");

    const svg = d3
      .select("#f3-chart")
      .append("svg")
      .attr("class", "tf")
      .attr("role", "group");

    const chart = svg.append("g");

    const layers = {
      grid: chart.append("g"),
      year: chart.append("text").attr("class", "bg-year"),
      axis: chart.append("g"),
      equality: chart.append("g"),
      points: chart.append("g")
    };

    const gradientColors = d3
      .range(0, 1.001, 0.1)
      .map(value => d3.interpolateViridis(value))
      .join(",");

    d3.select("#f3-legend").html(
      `<span class="grad">` +
        `<span>Women − men gap: ${formatSigned(gapExtent[0])} pts</span>` +
        `<i class="grad-bar" style="background:linear-gradient(90deg,${gradientColors})"></i>` +
        `<span>${formatSigned(gapExtent[1])} pts</span>` +
      `</span>`
    );

    function drawFrame() {
      layout = getChartSize("#f3-chart", 0.72, 1.0);

      layout.x = d3
        .scaleLinear()
        .domain(sharedDomain)
        .nice()
        .range([0, layout.innerWidth]);

      layout.y = d3
        .scaleLinear()
        .domain(layout.x.domain())
        .range([layout.innerHeight, 0]);

      svg
        .attr("viewBox", `0 0 ${layout.width} ${layout.height}`)
        .attr(
          "aria-label",
          "Scatterplot comparing female and male survival to age 65, one circle per country"
        );

      chart.attr(
        "transform",
        `translate(${layout.marginLeft},${layout.marginTop})`
      );

      const percent = value => `${value}%`;

      drawAxes(layers, layout, {
        xLabel: "Men surviving to age 65 (% of cohort)",
        xShort: "Men reaching 65 (%)",
        yLabel: "Women surviving to age 65 (% of cohort)",
        yShort: "Women reaching 65 (%)",
        xFormat: percent,
        yFormat: percent
      });

      layers.year
        .attr("x", layout.innerWidth - 8)
        .attr("y", layout.innerHeight - 12)
        .attr("text-anchor", "end")
        .attr("font-size", Math.min(78, layout.innerWidth * 0.13));

      const domain = layout.x.domain();
      layers.equality.html("");

      layers.equality
        .append("line")
        .attr("class", "eq-line")
        .attr("x1", layout.x(domain[0]))
        .attr("y1", layout.y(domain[0]))
        .attr("x2", layout.x(domain[1]))
        .attr("y2", layout.y(domain[1]));

      layers.equality
        .append("text")
        .attr("class", "zone-label f")
        .attr("x", 8)
        .attr("y", 16)
        .text("▲ Women more likely to reach 65");

      layers.equality
        .append("text")
        .attr("class", "zone-label m")
        .attr("x", layout.innerWidth - 8)
        .attr("y", layout.innerHeight - 62)
        .attr("text-anchor", "end")
        .text("Men more likely ▼");

      layers.equality
        .append("text")
        .attr("class", "annotation")
        .attr("x", layout.x(domain[0]) + 10)
        .attr("y", layout.y(domain[0]) - 8)
        .text("Dashed line: equal survival");
    }

    function writeText(year, data) {
      const count = data.length;
      const higherFemaleSurvival = data.filter(
        row => row.gap > 0
      ).length;
      const current = year === MAX_YEAR;
      const lead = current ? "Today" : `In ${year}`;

      d3.select("#f3-title").text(
        higherFemaleSurvival === count
          ? `${lead}, female survival to age 65 ${current ? "is" : "was"} higher in all ${count} countries`
          : `${lead}, female survival to age 65 ${current ? "is" : "was"} higher in ${higherFemaleSurvival} of ${count} countries`
      );

      const largest = d3.greatest(data, row => row.gap);

      d3.select("#f3-subtitle").text(
        `Each circle is one country. Farther right means more men survive to 65; ` +
        `higher means more women survive. Circles above the dashed line indicate higher female survival, ` +
        `and color shows the size of the difference.` +
        (largest
          ? ` Largest gap in ${year}: ${tidyName(largest.name)} (${formatSigned(largest.gap)} percentage points).`
          : "")
      );

      const medianGap = d3.median(data, row => row.gap);
      const aboveThreshold = data.filter(
        row => row.gap >= threshold
      ).length;

      d3.select("#f3-note").text(
        `In the typical (median) country in ${year}, female survival to age 65 is ` +
        `${formatOne(Math.abs(medianGap))} percentage points ` +
        `${medianGap >= 0 ? "higher" : "lower"} than male survival.` +
        (threshold > 0
          ? ` ${aboveThreshold} of ${count} countries have a gap of at least ${threshold} points.`
          : "") +
        ` Source: World Bank survival to age 65 (% of cohort), by sex.`
      );
    }

    function update(year, duration) {
      const data = rowsByYear.get(year) || [];
      const transition = selection =>
        duration > 0
          ? selection
              .transition()
              .duration(duration)
              .ease(d3.easeCubicInOut)
          : selection;

      layers.year.text(year);
      thresholdOutput.text(threshold);
      writeText(year, data);

      const points = layers.points
        .selectAll("circle.pt3")
        .data(data, row => row.code)
        .join(
          enter =>
            enter
              .append("circle")
              .attr("class", "pt3")
              .attr("r", 0)
              .attr("cx", row => layout.x(row.male))
              .attr("cy", row => layout.y(row.female)),
          updateSelection => updateSelection,
          exit =>
            duration > 0
              ? exit.transition().duration(150).attr("r", 0).remove()
              : exit.remove()
        );

      transition(points)
        .attr("cx", row => layout.x(row.male))
        .attr("cy", row => layout.y(row.female))
        .attr("r", layout.small ? 4.6 : 6)
        .attr("fill", row => color(row.gap))
        .attr("opacity", row => (row.gap >= threshold ? 0.9 : 0.12));

      points
        .on("mouseenter mousemove", (event, row) =>
          showTooltip(
            event,
            `<strong>${tidyName(row.name)}</strong>` +
              `<div class="tip-h">${year}</div>` +
              tooltipRow("Women reaching 65", `${formatOne(row.female)}%`) +
              tooltipRow("Men reaching 65", `${formatOne(row.male)}%`) +
              tooltipRow("Gap", `${formatSigned(row.gap)} pts`)
          )
        )
        .on("mouseleave", hideTooltip);
    }

    const yearControl = createYearControl("f3", update);

    thresholdInput.on("input", function () {
      threshold = +this.value;
      update(yearControl.get(), 150);
    });

    drawFrame();
    yearControl.set(MAX_YEAR, 0);

    runOnResize(() => {
      drawFrame();
      update(yearControl.get(), 0);
    });
  }
})();