const handicapData = [
  [
    {
      oddType: "0",
      odd: "1.79",
      teamName: "纽卡斯尔联",
      imgType: "win",
      fluxType: "",
      content: [
        "平手盘（0）时投注获胜的队伍为赢，纽卡斯尔联获胜",
        "故投注纽卡斯尔联（0）为赢",
      ],
    },
    {
      oddType: "0",
      odd: "1.79",
      teamName: "热刺",
      imgType: "lose",
      fluxType: "",
      content: [
        "平手盘（0）时投注获胜的队伍为赢，热刺败北",
        "故投注热刺（0）为输",
      ],
    },
  ],
  [
    {
      oddType: "-0/0.5",
      odd: "1.79",
      teamName: "纽卡斯尔联",
      imgType: "win",
      fluxType: "",
      content: [
        "热刺获得受让分后，让分结果为：2-0或者2-0.5 <br> 均为纽卡斯尔联获胜",
        "故投注纽卡斯尔联（-0/0.5）为赢",
      ],
    },
    {
      oddType: "+0/0.5",
      odd: "1.79",
      teamName: "热刺",
      imgType: "lose",
      fluxType: "",
      content: [
        "热刺获得受让分后，让分结果为：2-0或者2-0.5 均为热刺败北",
        "故投注热刺（+0/0.5）为输",
      ],
    },
  ],
  [
    {
      oddType: "-1",
      odd: "1.79",
      teamName: "纽卡斯尔联",
      imgType: "win",
      fluxType: "",
      content: [
        "热刺获得受让分后，让分结果为：2-1，注纽卡斯尔联获胜",
        "故投注纽卡斯尔联（-1）为赢",
      ],
    },
    {
      oddType: "+1",
      odd: "1.79",
      teamName: "热刺",
      imgType: "lose",
      fluxType: "",
      content: [
        "热刺获得受让分后，让分结果为：2-1，热刺败北",
        "故投注热刺（+1) 为输",
      ],
    },
  ],
  [
    {
      oddType: "-1.5/2",
      odd: "1.79",
      teamName: "纽卡斯尔联",
      imgType: "winHalf",
      fluxType: "",
      content: [
        "热刺获得受让分后，让分结果为：2-1.5或2-2，2-1.5时， 纽卡斯尔联获胜；2-2时为和局；一半赛果为纽卡斯尔联获胜",
        "故投注纽卡斯尔联（-1.5/2）为赢",
      ],
    },
    {
      oddType: "+1.5/2",
      odd: "1.79",
      teamName: "热刺",
      imgType: "loseHalf",
      fluxType: "",
      content: [
        "热刺获得受让分后，让分结果为：2-1.5或2-2，2-1.5时 热刺败北；2-2时为和局；一半赛果为热刺败北",
        "故投注热刺（+1.5/2）为输一半",
      ],
    },
  ],
];

const ouData = [
  [
    {
      oddType: "大1.5",
      odd: "1.79",
      teamName: "",
      imgType: "win",
      fluxType: "",
      content: ["进球数为2，大于1.5", "故投注（大1.5）赢"],
    },
    {
      oddType: "小1.5",
      odd: "1.79",
      teamName: "",
      imgType: "lose",
      fluxType: "",
      content: ["进球数为2，大于1.5", "故投注（小1.5）输"],
    },
  ],
  [
    {
      oddType: "大1.5/2",
      odd: "1.79",
      teamName: "",
      imgType: "winHalf",
      fluxType: "",
      content: [
        "进球数为2，大于投注项1.5为赢，等于投注项2为打和； 一半的结果为赢",
        "故投注（大1.5/2）为赢一半",
      ],
    },
    {
      oddType: "小1.5/2",
      odd: "1.79",
      teamName: "",
      imgType: "loseHalf",
      fluxType: "",
      content: [
        "进球数为2，大于投注项1.5为输，等于投注项2为打和；<br/>一半的结果为输",
        "故投注（小1.5/2）为输一半",
      ],
    },
  ],
  [
    {
      oddType: "大2",
      odd: "1.79",
      teamName: "",
      imgType: "returnPrincipal",
      fluxType: "",
      content: [
        "进球数为2，等于投注项2为打和，和局退款",
        "故投注（大2）为退回本金",
      ],
    },
    {
      oddType: "小2",
      odd: "1.79",
      teamName: "",
      imgType: "returnPrincipal",
      fluxType: "",
      content: [
        "进球数为2，等于投注项2为打和，和局退款",
        "故投注（小2）为退回本金",
      ],
    },
  ],
  [
    {
      oddType: "大2/2.5",
      odd: "1.79",
      teamName: "",
      imgType: "loseHalf",
      fluxType: "",
      content: [
        "进球数为2，等于投注项2为打和，小于投注2.5为输； 一半的结果为输",
        "故投注（大2/2.5）为输一半",
      ],
    },
    {
      oddType: "小2/2.5",
      odd: "1.79",
      teamName: "",
      imgType: "winHalf",
      fluxType: "",
      content: [
        "进球数为2，等于投注项2为打和，小于投注2.5为赢； 一半的结果为赢",
        "故投注（小2/2.5）为赢一半",
      ],
    },
  ],
];

const singleData = [
  [
    {
      oddType: "主胜",
      odd: "1.79",
      teamName: "",
      imgType: "win",
      fluxType: "",
      content: ["纽卡斯尔联赢2球，获胜", "故投注（主胜）为赢"],
    },
    {
      oddType: "和局",
      odd: "1.79",
      teamName: "",
      imgType: "lose",
      fluxType: "",
      content: ["纽卡斯尔联赢2球，非和局", "故投注（和局）为输"],
    },
    {
      oddType: "客胜",
      odd: "1.79",
      teamName: "",
      imgType: "lose",
      fluxType: "",
      content: ["热刺输2球，败北", "故投注（客胜）为输"],
    },
  ],
];

const cornerData = [
  [
    {
      oddType: "-1.5",
      odd: "1.79",
      teamName: "纽卡斯尔联",
      imgType: "win",
      fluxType: "",
      content: [
        "热刺获得受让分后，角球让分结果为：7-6.5，纽卡斯尔联获胜",
        "故投注纽卡斯尔联（-1.5）为赢",
      ],
    },
    {
      oddType: "+1.5",
      odd: "1.79",
      teamName: "热刺",
      imgType: "lose",
      fluxType: "",
      content: ["热刺获得受让分后，角球让分结果为：7-6.5，热刺败北"],
    },
  ],
  [
    {
      oddType: "-1.5/2",
      odd: "1.79",
      teamName: "纽卡斯尔联",
      imgType: "winHalf",
      fluxType: "",
      content: [
        "热刺获得受让分后，角球让分结果为：7-6.5或7-7；7-6.5时 纽卡斯尔联获胜；7-7时为和局；一半的赛果为纽卡斯尔联获胜",
        "故投注纽卡斯尔联（-1.5）为赢",
      ],
    },
    {
      oddType: "+1.5/2",
      odd: "1.79",
      teamName: "热刺",
      imgType: "loseHalf",
      fluxType: "",
      content: [
        "热刺获得受让分后，角球让分结果为：7-6.5或7-7；7-6.5时 纽卡斯尔联获胜；7-7时为和局；一半的赛果为热刺败北",
      ],
    },
  ],
];

const oeData = [
  [
    {
      oddType: "单",
      odd: "1.79",
      fluxType: "up",
      teamName: "",
      imgType: "lose",
      content: ["进球数为2，为双数.", "故投注（单）为输"],
    },
    {
      oddType: "双",
      odd: "1.45",
      fluxType: "down",
      teamName: "",
      imgType: "win",
      content: ["进球数为2，为双数.", "故投注（双）为赢"],
    },
  ],
];

const csData = [
    [
      {
        oddType: "2-0",
        odd: "1.79",
        fluxType: "up",
        teamName: "",
        imgType: "win",
        content: ["赛果与投注项完全一致", "故投注（2-0）为赢"],
      },
      {
        oddType: "其他比分",
        odd: "1.69",
        fluxType: "",
        teamName: "",
        imgType: "lose",
        content: ["仅当赛果与所有比分选项不一致时，投注‘其他比分’为赢； 当前有与比赛比分一致的投注项", "故投注（其他比分）为输"],
      },
      {
        oddType: "0-2",
        odd: "1.45",
        fluxType: "down",
        teamName: "",
        imgType: "lose",
        content: ["投注比分与赛果比分不一致", "故投注（0-2）为输"],
      },
    ],
  ];

export { handicapData, ouData, singleData, cornerData, oeData, csData };
