import React, { useState, useEffect } from 'react';
import { useLanguage } from "@/context/LanguageContext";

// Collection of activity images by category
const activityImageData = {
    // Adventure Activities
    adventure: {
      // Ziplining & Aerial Activities
      "zipline": [
        "https://images.unsplash.com/photo-1541512416146-3c2f5262fd85?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1629469957146-6ae6eaad1ce1?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1622631211624-78057f8ef6fa?auto=format&fit=crop&w=1200"
      ],
      "ziplining": [
        "https://images.unsplash.com/photo-1541512416146-3c2f5262fd85?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1629469957146-6ae6eaad1ce1?auto=format&fit=crop&w=1200"
      ],
      "paragliding": [
        "https://images.unsplash.com/photo-1622760342278-53cf3e29ecb0?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1548575426-b7552a258e6a?auto=format&fit=crop&w=1200"
      ],
      "skydiving": [
        "https://images.unsplash.com/photo-1521673252667-e05da380b252?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1597013216032-9e1166ffa85b?auto=format&fit=crop&w=1200"
      ],
      "bungee": [
        "https://images.unsplash.com/photo-1526385159909-196a9ac0ef64?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1542144649-c4bb0466dfff?auto=format&fit=crop&w=1200"
      ],
      "helicopter": [
        "https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1608322462661-43210f9b386c?auto=format&fit=crop&w=1200"
      ],
      
      // Hiking & Mountain Activities
      "hike": [
        "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=1200"
      ],
      "hiking": [
        "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=1200"
      ],
      "trek": [
        "https://images.unsplash.com/photo-1598542777052-81eb0e69914f?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1619024027602-2433d502f569?auto=format&fit=crop&w=1200" 
      ],
      "trekking": [
        "https://images.unsplash.com/photo-1598542777052-81eb0e69914f?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1606846614493-422e5fbd474e?auto=format&fit=crop&w=1200"
      ],
      "trail": [
        "https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1624090809476-9614faad3a96?auto=format&fit=crop&w=1200"
      ],
      "mountain": [
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1579864629879-7179a1254b28?auto=format&fit=crop&w=1200"
      ],
      "climbing": [
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1601224748193-d3f3c1d01b48?auto=format&fit=crop&w=1200"
      ],
      "rock climbing": [
        "https://images.unsplash.com/photo-1601224748193-d3f3c1d01b48?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1593103106028-3ded3edbac57?auto=format&fit=crop&w=1200"
      ],
      "mountaineering": [
        "https://images.unsplash.com/photo-1543922596-b3bbaba80649?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1604756311361-ed50cf9893c4?auto=format&fit=crop&w=1200"
      ],
      "summit": [
        "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1586958991731-a7dfa012ec8a?auto=format&fit=crop&w=1200"
      ],
      "volcano": [
        "https://images.unsplash.com/photo-1621935093281-2b174612a55c?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1621935183012-a1b3253b4789?auto=format&fit=crop&w=1200"
      ],
      
      // Animal & Wildlife Activities
      "safari": [
        "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1574236170880-db99a7a39672?auto=format&fit=crop&w=1200"
      ],
      "wildlife": [
        "https://images.unsplash.com/photo-1504173010664-32509aeebb62?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1510379374754-332d668cbfa6?auto=format&fit=crop&w=1200"
      ],
      "horseback": [
        "https://images.unsplash.com/photo-1611516818236-1e5f910905a5?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1602440348612-2c2cfe1bfbf8?auto=format&fit=crop&w=1200"
      ],
      "horseback riding": [
        "https://images.unsplash.com/photo-1611516818236-1e5f910905a5?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1602440348612-2c2cfe1bfbf8?auto=format&fit=crop&w=1200"
      ],
      "riding": [
        "https://images.unsplash.com/photo-1602440348612-2c2cfe1bfbf8?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1584323213357-469cc000ec41?auto=format&fit=crop&w=1200"
      ],
      "animal": [
        "https://images.unsplash.com/photo-1591824438708-ce405f36ba3d?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1548506446-86bfddac5620?auto=format&fit=crop&w=1200"
      ],
      "birdwatching": [
        "https://images.unsplash.com/photo-1605351770859-86ab2e6658d2?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1600416909748-d98c16dc1ae4?auto=format&fit=crop&w=1200"
      ],
      "dolphin": [
        "https://images.unsplash.com/photo-1607153333879-c174d265f1d2?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1566249278656-f52d03e8e4ae?auto=format&fit=crop&w=1200"
      ],
      "whale": [
        "https://images.unsplash.com/photo-1568430462989-44163eb1752f?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1548365328-8c6db3220e4c?auto=format&fit=crop&w=1200"
      ]
    },
    
    // Water Activities
    water: {
      // Beach Activities
      "beach": [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1520942702018-0862200e6873?auto=format&fit=crop&w=1200"
      ],
      "beachfront": [
        "https://images.unsplash.com/photo-1591017403286-fd8493524e1e?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=1200"
      ],
      "shore": [
        "https://images.unsplash.com/photo-1468413253725-0d5181091126?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200"
      ],
      "coast": [
        "https://images.unsplash.com/photo-1566024164372-0281f1133aa6?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1511848727439-9c607a74e539?auto=format&fit=crop&w=1200"
      ],
      "picnic": [
        "https://images.unsplash.com/photo-1529080133550-1f94b4bdb364?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1595034522784-56c086026ea6?auto=format&fit=crop&w=1200"
      ],
      "sunset": [
        "https://images.unsplash.com/photo-1570099664936-2784ba4db9f8?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?auto=format&fit=crop&w=1200"
      ],
      
      // Water Sports
      "surf": [
        "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1581000197348-77e75c0c1fb5?auto=format&fit=crop&w=1200"
      ],
      "surfing": [
        "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1505459668311-8dfac7952bf0?auto=format&fit=crop&w=1200"
      ],
      "swimming": [
        "https://images.unsplash.com/photo-1560090995-01632a28895b?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?auto=format&fit=crop&w=1200"
      ],
      "swim": [
        "https://images.unsplash.com/photo-1560090995-01632a28895b?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200"
      ],
      "snorkel": [
        "https://images.unsplash.com/photo-1516474061198-4da33839d665?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1535537334961-8f39d39f4b09?auto=format&fit=crop&w=1200"
      ],
      "snorkeling": [
        "https://images.unsplash.com/photo-1516474061198-4da33839d665?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1535537334961-8f39d39f4b09?auto=format&fit=crop&w=1200"
      ],
      "dive": [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=1200"
      ],
      "diving": [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1544551763-a9d429dcbbc9?auto=format&fit=crop&w=1200"
      ],
      "scuba": [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1586043827731-b87d0f442590?auto=format&fit=crop&w=1200"
      ],
      "paddleboard": [
        "https://images.unsplash.com/photo-1526046881250-dbea46099c67?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1512519716973-3c5bd02a3256?auto=format&fit=crop&w=1200"
      ],
      "kayak": [
      "https://images.unsplash.com/photo-1620903669944-de50fbe78210?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1465310477141-6fb93167a273?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ],
    "kayaking": [
      "https://images.unsplash.com/photo-1463694775559-eea25626346d?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1511098266841-cad50fbd1f1f?auto=format&fit=crop&w=1200"
    ],
    "canoe": [
      "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1485389556422-01a3a1cb9db0?auto=format&fit=crop&w=1200"
    ],
    "canoeing": [
      "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1511386363918-676a6a4d6e7a?auto=format&fit=crop&w=1200"
    ],
    "rafting": [
      "https://images.unsplash.com/photo-1559524098-90a1f01c637b?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1574166465903-1edf6dfbf749?auto=format&fit=crop&w=1200"
    ],
    "waterfall": [
      "https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1564710654729-ff358191c127?auto=format&fit=crop&w=1200"
    ],
    
    // Marine & Sailing Activities
    "sea": [
      "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1518132006340-7b97233d3cd4?auto=format&fit=crop&w=1200"
    ],
    "ocean": [
      "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1468581264429-2548ef9eb732?auto=format&fit=crop&w=1200"
    ],
    "boat": [
      "https://images.unsplash.com/photo-1527431293370-0cd7ef7c90f3?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1593351415075-3bac9f45c877?auto=format&fit=crop&w=1200"
    ],
    "boating": [
      "https://images.unsplash.com/photo-1527431293370-0cd7ef7c90f3?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1593351415075-3bac9f45c877?auto=format&fit=crop&w=1200"
    ],
    "cruise": [
      "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200"
    ],
    "cruising": [
      "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200"
    ],
    "sailing": [
      "https://images.unsplash.com/photo-1500514966906-fe245eea9344?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1630344743700-2bf9e394f5a0?auto=format&fit=crop&w=1200"
    ],
    "yacht": [
      "https://images.unsplash.com/photo-1566846128021-b940b0eec910?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200"
    ],
    "catamaran": [
      "https://images.unsplash.com/photo-1570735380162-2e2ffc835b21?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1635858991718-38f58a721dbb?auto=format&fit=crop&w=1200"
    ],
    "fishing": [
      "https://images.unsplash.com/photo-1541742425281-c1d3fc8aff96?q=80&w=2012&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1545285446-a9c1b22039f7?auto=format&fit=crop&w=1200"
    ],
    "maritime": [
      "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1200"
    ],
    "harbor": [
      "https://images.unsplash.com/photo-1520443240718-fce21901db79?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1569579712579-f7b880a3c406?auto=format&fit=crop&w=1200"
    ],
    "harbour": [
      "https://images.unsplash.com/photo-1520443240718-fce21901db79?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1569579712579-f7b880a3c406?auto=format&fit=crop&w=1200"
    ],
    "marina": [
      "https://images.unsplash.com/photo-1585735633302-ea202b0d4513?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1585759036745-6fa72e338d1a?auto=format&fit=crop&w=1200"
    ]
  },
  
  // Cultural & Urban Activities
  cultural: {
    // Museums & Art
    "museum": [
        "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200"
    ],
    "gallery": [
      "https://images.unsplash.com/photo-1594388572748-608588c3c145?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1574217013471-c32c6846cef7?auto=format&fit=crop&w=1200"
    ],
    "art": [
      "https://images.unsplash.com/photo-1594388572748-608588c3c145?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1545989253-02cc26577f88?auto=format&fit=crop&w=1200"
    ],
    "exhibition": [
      "https://images.unsplash.com/photo-1563804447971-6e113ab80713?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1579683707581-5abc99b8a0fb?auto=format&fit=crop&w=1200"
    ],
    
    // Historical Sites
    "castle": [
      "https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1573108037329-5cd321f72d0e?auto=format&fit=crop&w=1200"
    ],
    "palace": [
      "https://images.unsplash.com/photo-1548248823-ce16a73b6d49?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1587974728375-67d203a83f20?auto=format&fit=crop&w=1200"
    ],
    "cathedral": [
      "https://images.unsplash.com/photo-1543348750-466b55f32f16?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1548248522-dc0b87a9307a?auto=format&fit=crop&w=1200"
    ],
    "church": [
      "https://images.unsplash.com/photo-1543348750-466b55f32f16?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1461301214746-1e109215d6d3?auto=format&fit=crop&w=1200"
    ],
    "temple": [
      "https://images.unsplash.com/photo-1580889272861-dc2dbea5468d?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1504934124608-518fabaaa5b0?auto=format&fit=crop&w=1200"
    ],
    "mosque": [
      "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1545167496-c1e5198543de?auto=format&fit=crop&w=1200"
    ],
    "ruins": [
      "https://images.unsplash.com/photo-1548080819-68c6ab23e822?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1569584139337-3434e121c06c?auto=format&fit=crop&w=1200"
    ],
    "historic": [
      "https://images.unsplash.com/photo-1558526944-1f9be3bea5a9?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200"
    ],
    "monument": [
      "https://images.unsplash.com/photo-1568668392383-c923811e4ad7?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1562671753-6360e96c7915?auto=format&fit=crop&w=1200"
    ],
    "memorial": [
      "https://images.unsplash.com/photo-1556794285-11695ab89d68?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1566231346068-8e643bb315a2?auto=format&fit=crop&w=1200"
    ],
    "archaeology": [
        "https://images.unsplash.com/photo-1601378660502-88538e5b783d?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1601379107138-9e8f8af0ae4d?auto=format&fit=crop&w=1200"
    ],

    // Urban Exploration
    "city": [
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200"
    ],
    "downtown": [
      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200"
    ],
    "urban": [
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1490642914619-7955a3fd483c?auto=format&fit=crop&w=1200"
    ],
    "skyline": [
      "https://images.unsplash.com/photo-1470219556762-1771e7f9427d?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200"
    ],
    "architecture": [
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1493397212122-2b85dda8106b?auto=format&fit=crop&w=1200"
    ],
    "shopping": [
      "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1200"
    ],
    "market": [
      "https://images.unsplash.com/photo-1513125370-3460ebe3401b?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=1200"
    ],
    "bazaar": [
      "https://images.unsplash.com/photo-1555072956-7758afb20e8f?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1558005530-a7958896ec60?auto=format&fit=crop&w=1200"
    ],
    "street": [
      "https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1200",
      ""
    ],
    "walking": [
      ""
    ],
    "walking tour": [
      "",
      ""
    ],
    "tour": [
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?auto=format&fit=crop&w=1200"
    ],
    "guide": [
      "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200"
    ],
    
    // Cultural Experiences
    "performance": [
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200"
    ],
    "concert": [
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200"
    ],
    "theater": [
      "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200"
    ],
    "cinema": [
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200"
    ],
    "movie": [
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1522609925277-66fea332c575?auto=format&fit=crop&w=1200"
    ],
    "opera": [
      "https://images.unsplash.com/photo-1580809361436-42a7ec5c14fe?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200"
    ],
    "ballet": [
      "https://images.unsplash.com/photo-1532871286412-6309983e2506?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1546704864-07229a472782?auto=format&fit=crop&w=1200"
    ],
    "dance": [
      "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1520367445093-50dc08a59d9d?auto=format&fit=crop&w=1200"
    ],
    "festival": [
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1200"
    ],
    "celebration": [
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1481162854517-d9e353af153d?auto=format&fit=crop&w=1200"
    ],
    "parade": [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1541423408854-5df732b6f6d1?auto=format&fit=crop&w=1200"
    ],
    "cultural": [
      "https://images.unsplash.com/photo-1511735643442-503bb3bd348a?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1625985335355-d2384d3b527e?auto=format&fit=crop&w=1200"
    ],
    "traditional": [
      "https://images.unsplash.com/photo-1516687605123-a218f18f3738?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1530373239086-f6c073019ec3?auto=format&fit=crop&w=1200"
    ],
    "ceremony": [
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200"
    ]
  },
  
  // Food & Relaxation Activities
  lifestyle: {
    // Food & Drink
    "restaurant": [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200"
    ],
    "dining": [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200"
    ],
    "dinner": [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1518619745898-597f52cf5564?auto=format&fit=crop&w=1200"
    ],
    "lunch": [
      "https://images.unsplash.com/photo-1600335895229-6e75511892c8?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=1200"
    ],
    "breakfast": [
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1495214783159-3503f1c2610d?auto=format&fit=crop&w=1200"
    ],
    "food": [
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200"
    ],
    "meal": [
      "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1529566652340-2c41a1eb6d93?auto=format&fit=crop&w=1200"
    ],
    "culinary": [
      "https://images.unsplash.com/photo-1583225214464-9296029427aa?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1505935428862-770b6f24f629?auto=format&fit=crop&w=1200"
    ],
    "tasting": [
      "https://images.unsplash.com/photo-1559842438-2942c907c8fe?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=1200"
    ],
    "cooking": [
      "https://images.unsplash.com/photo-1556909172-8c2f041fca1e?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1542010589005-d1eacc3918f2?auto=format&fit=crop&w=1200"
    ],
    "class": [
      "https://images.unsplash.com/photo-1527690789675-4ea7d8da4fe6?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200"
    ],
    "wine": [
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1553361371-9513901d383f?auto=format&fit=crop&w=1200"
    ],
    "winery": [
      "https://images.unsplash.com/photo-1588694392556-6138fe9ae436?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1598306442928-4d90f32c6866?auto=format&fit=crop&w=1200"
    ],
    "vineyard": [
        "https://images.unsplash.com/photo-1558920559-907042618f5b?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1561657915-0991dfbf69a3?auto=format&fit=crop&w=1200"
      ],
      "brewery": [
        "https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200"
      ],
      "beer": [
        "https://images.unsplash.com/photo-1574711852243-5a88231b77fa?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1618183479302-1e0aa382c36b?auto=format&fit=crop&w=1200"
      ],
      "bar": [
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200"
      ],
      "cafe": [
        "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200"
      ],
      "coffee": [
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1525480122447-64809d765ec4?auto=format&fit=crop&w=1200"
      ],
      
      // Wellness & Relaxation
      "spa": [
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200"
      ],
      "massage": [
        "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200"
      ],
      "wellness": [
        "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200"
      ],
      "relaxation": [
        "https://images.unsplash.com/photo-1531685250784-7569952593d2?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200"
      ],
      "hot spring": [
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1504318805949-0b90e6a96dc7?auto=format&fit=crop&w=1200"
      ],
      "thermal": [
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1621855403100-701fb7ea5c67?auto=format&fit=crop&w=1200"
      ],
      "bath": [
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200"
      ],
      "onsen": [
        "https://images.unsplash.com/photo-1572130321181-81f689113d58?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1596465923969-a6cb35b0f55f?auto=format&fit=crop&w=1200"
      ],
      "yoga": [
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=1200"
      ],
      "meditation": [
"https://images.unsplash.com/photo-1508672019048-805c876b67e3?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1470137237906-d8a4f71e1966?auto=format&fit=crop&w=1200"
    ],
    "mindfulness": [
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200"
    ],
    "retreat": [
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200"
    ]
  },
  
  // Nature & Landscape
  nature: {
    // Natural Landscapes
    "forest": [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200"
    ],
    "woods": [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1503435980610-a51f3ddfee50?auto=format&fit=crop&w=1200"
    ],
    "park": [
      "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1468810527216-532db6db4a10?auto=format&fit=crop&w=1200"
    ],
    "garden": [
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200"
    ],
    "botanical": [
      "https://images.unsplash.com/photo-1590837132963-cce65070f342?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1501684691657-cf3012635478?auto=format&fit=crop&w=1200"
    ],
    "field": [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1535911062114-764574491173?auto=format&fit=crop&w=1200"
    ],
    "meadow": [
      "https://images.unsplash.com/photo-1501685532562-aa6846b31a3e?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1502517607734-2684929589b3?auto=format&fit=crop&w=1200"
    ],
    "valley": [
      "https://images.unsplash.com/photo-1606045752886-e56218d45afd?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1573551565922-aec98de55fe2?auto=format&fit=crop&w=1200"
    ],
    "river": [
      "https://images.unsplash.com/photo-1558196209-7894cc40f7b3?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1623345805780-8f01f714e65f?auto=format&fit=crop&w=1200"
    ],
    "lake": [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1543097692-fa13c6cd8595?auto=format&fit=crop&w=1200"
    ],
    "cave": [
      "https://images.unsplash.com/photo-1504516586076-3393005c9894?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1529076461912-ac29e83df0b1?auto=format&fit=crop&w=1200"
    ],
    "canyon": [
      "https://images.unsplash.com/photo-1578249949606-e0d15d536442?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1530126483408-aa533e55bdb2?auto=format&fit=crop&w=1200"
    ],
    "desert": [
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=1200"
    ],
    "dune": [
      "https://images.unsplash.com/photo-1519516125073-111ee7692f91?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1610050028661-b34a83d8e12f?auto=format&fit=crop&w=1200"
    ],
    "beach": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200"
    ],
    "countryside": [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1520262494112-9fe481d36ec3?auto=format&fit=crop&w=1200"
    ],
    "landscape": [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200"
    ],
    
    // Celestial & Weather Events
    "astronomy": [
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1540198163009-7afde3ce3ebf?auto=format&fit=crop&w=1200"
    ],
    "stargazing": [
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1580152040942-85a21f89d305?auto=format&fit=crop&w=1200"
    ],
    "northern lights": [
      "https://images.unsplash.com/photo-1566408669374-5a6b32bd6cd7?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1517332956732-541df6cbc1a9?auto=format&fit=crop&w=1200"
    ],
    "aurora": [
      "https://images.unsplash.com/photo-1566408669374-5a6b32bd6cd7?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1581211865647-703647fa78f7?auto=format&fit=crop&w=1200"
    ],
    "sunrise": [
      "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1504466334719-af4ae9f12ad0?auto=format&fit=crop&w=1200"
    ],
    "sunset": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?auto=format&fit=crop&w=1200"
    ],
    "rainbow": [
      "https://images.unsplash.com/photo-1558662413-6ddb5a22bd53?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1629214831861-c1f5fec4bae6?auto=format&fit=crop&w=1200"
    ]
  },
  
  // Sports & Recreation
  sports: {
    // Various Sports
    "golf": [
      "https://images.unsplash.com/photo-1587174786073-ae5e5cff23aa?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1535131749006-b7d58ee532cc?auto=format&fit=crop&w=1200"
    ],
    "tennis": [
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1622279457486-28f307b153ce?auto=format&fit=crop&w=1200"
    ],
    "skiing": [
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1605540436563-5bca919ee766?auto=format&fit=crop&w=1200"
    ],
    "snowboarding": [
      "https://images.unsplash.com/photo-1522056615691-da7b8106c045?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1605540436330-9a7469361480?auto=format&fit=crop&w=1200"
    ],
    "biking": [
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1608990827289-31f477255dd5?auto=format&fit=crop&w=1200"
    ],
    "cycling": [
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200"
    ],
    "running": [
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1559166631-ef208440c75a?auto=format&fit=crop&w=1200"
    ],
    "basketball": [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1518650845922-77a989b38afc?auto=format&fit=crop&w=1200"
    ],
    "football": [
      "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200"
    ],
    "soccer": [
      "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200", 
      "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=1200"
    ],
    "volleyball": [
      "https://images.unsplash.com/photo-1562552052-4e9f2d8e8a42?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=1200"
    ],
    "baseball": [
      "https://images.unsplash.com/photo-1508344928928-7165b0c40ae7?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1513267048331-5611cad62e41?auto=format&fit=crop&w=1200"
    ],
    "hockey": [
      "https://images.unsplash.com/photo-1580412581600-9b8f1bb49db4?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1541426062480-22e56abbc8c9?auto=format&fit=crop&w=1200"
    ],
    "surfing": [
      "https://images.unsplash.com/photo-1531722569936-825d3dd91b15?auto=format&fit=crop&w=1200",
      "https://images.unsplash.com/photo-1623103848683-33856fcb6196?auto=format&fit=crop&w=1200"
    ],
}
    };

// Default images based on time of day
const timeOfDayImages = {
  "morning": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200",
  "afternoon": "https://images.unsplash.com/photo-1502209524164-acea936639a2?auto=format&fit=crop&w=1200",
  "evening": "https://images.unsplash.com/photo-1507400492013-162706c8c05e?auto=format&fit=crop&w=1200"
};

// Fallback image
// Fallback image
const fallbackImage = "/moderate1.jpg";

function Activities({ trip }) {
    const [selectedDay, setSelectedDay] = useState(1);
    const dayKeys = trip?.tripData?.itinerary ? Object.keys(trip.tripData.itinerary) : [];
    const [loadedActivityImages, setLoadedActivityImages] = useState({});
    const [loadingImages, setLoadingImages] = useState({});
    const destination = trip?.tripData?.trip?.destination || '';
    const { translate, language } = useLanguage();
const isRTL = language === "he";

    // Load images for current day's activities
    useEffect(() => {
        if (dayKeys.length && trip?.tripData?.itinerary[`day${selectedDay}`]) {
            assignActivityImages();
        }
    }, [selectedDay, trip]);

    // Function to find the best image for an activity
    const getActivityImage = (activity) => {
        // Check activity name and description for keywords
        const activityText = `${activity.activity} ${activity.description}`.toLowerCase();

        // Find matching image based on keywords
        for (const [keyword, url] of Object.entries(activityImageData)) {
            if (activityText.includes(keyword.toLowerCase())) {
                return url;
            }
        }

        // Default images based on time of day
        const timeOfDay = activity.bestTime.toLowerCase();
        if (timeOfDay.includes('am') || timeOfDay.includes('morning')) {
            return timeOfDayImages.morning;
        } else if (timeOfDay.includes('pm') && parseInt(activity.bestTime.split(':')[0]) < 6) {
            return timeOfDayImages.afternoon;
        } else {
            return timeOfDayImages.evening;
        }
    };

    // Assign images to activities with simulated loading
    const assignActivityImages = () => {
        const activities = trip.tripData.itinerary[`day${selectedDay}`];
        const newImages = { ...loadedActivityImages };
        const newLoadingStates = { ...loadingImages };
        const usedImagesForDay = new Set();
    
        // Set loading states for all activities in this day
        activities.forEach(activity => {
            const activityId = `${selectedDay}_${activity.activity}`;
            if (!newImages[activityId]) {
                newLoadingStates[activityId] = true;
            }
        });
        setLoadingImages(newLoadingStates);
    
        // Simulate loading delay (remove this setTimeout for instant loading)
        setTimeout(() => {
            // Process each activity
            activities.forEach((activity, index) => {
                const activityId = `${selectedDay}_${activity.activity}`;
                
                if (!newImages[activityId]) {
                    try {
                      // Use the same matching logic as getImageForActivity
                      const imageUrl = getImageForActivity(activity, index);
                      newImages[activityId] = imageUrl;
                    } catch (error) {
                      console.error(`Error assigning image for ${activity.activity}:`, error);
                      newImages[activityId] = fallbackImage;
                    } finally {
                      newLoadingStates[activityId] = false;
                    }
                  }
                });
                
                setLoadedActivityImages(newImages);
                setLoadingImages(newLoadingStates);
        }, 300); // 300ms simulated loading for a smoother experience
    };

    // Function to get image for a specific activity
    const getImageForActivity = (activity, index) => {
        const activityId = `${selectedDay}_${activity.activity}`;
        
        // If image is already loaded, return it
        if (loadedActivityImages[activityId]) {
          return loadedActivityImages[activityId];
        }
        
        const activityText = `${activity.activity} ${activity.description || ''}`.toLowerCase();
        
        // Track already used images to avoid duplicates
        const usedImagesForCurrentDay = new Set();
        trip?.tripData?.itinerary[`day${selectedDay}`]?.forEach((act, i) => {
          if (i < index && loadedActivityImages[`${selectedDay}_${act.activity}`]) {
            usedImagesForCurrentDay.add(loadedActivityImages[`${selectedDay}_${act.activity}`]);
          }
        });
        
        // Store all potential matches with their priority scores
        const matches = [];
        
        // 1. First search for multi-word exact matches (highest priority)
        for (const category in activityImageData) {
          for (const keyword in activityImageData[category]) {
            if (keyword.includes(' ') && activityText.includes(keyword.toLowerCase())) {
              matches.push({
                keyword,
                category,
                images: activityImageData[category][keyword],
                priority: 100 + keyword.length // Multi-word exact matches get highest priority
              });
            }
          }
        }
        
        // 2. Then look for single-word exact matches
        for (const category in activityImageData) {
          for (const keyword in activityImageData[category]) {
            if (!keyword.includes(' ') && activityText.includes(keyword.toLowerCase())) {
              // Check if this is a whole word match, not part of another word
              const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`);
              if (regex.test(activityText)) {
                matches.push({
                  keyword,
                  category,
                  images: activityImageData[category][keyword],
                  priority: 50 + keyword.length // Single-word exact matches get medium priority
                });
              }
            }
          }
        }
        
        // 3. Finally check partial matches for longer words
        if (matches.length === 0) {
          const words = activityText.split(/\s+/);
          
          for (const word of words) {
            if (word.length < 4) continue; // Skip very short words
            
            for (const category in activityImageData) {
              for (const keyword in activityImageData[category]) {
                if (keyword.toLowerCase().includes(word) || word.includes(keyword.toLowerCase())) {
                  matches.push({
                    keyword,
                    category,
                    images: activityImageData[category][keyword],
                    priority: 10 + Math.min(word.length, keyword.length) // Partial matches get lowest priority
                  });
                }
              }
            }
          }
        }
        
        // Sort matches by priority (descending)
        matches.sort((a, b) => b.priority - a.priority);
        
        // Special case handling for common activities
        const activityLower = activity.activity.toLowerCase();
        
        // Handle specific cases like "Fish Market" = combination of "fish" and "market"
        if (activityLower.includes('market')) {
          if (activityLower.includes('fish market') || activityLower.includes('fish') || activityLower.includes('seafood')) {
            // Try to find fish market or market images
            const marketImages = activityImageData.cultural?.market || [];
            if (marketImages.length > 0) {
              for (const img of marketImages) {
                if (!usedImagesForCurrentDay.has(img)) {
                  return img;
                }
              }
              return marketImages[0];
            }
          }
        }
        
        // Go through matches in priority order
        for (const match of matches) {
          if (!match.images || !Array.isArray(match.images) || match.images.length === 0) {
            continue;
          }
          
          // Try to find an unused image
          for (const img of match.images) {
            if (img && !usedImagesForCurrentDay.has(img)) {
              return img;
            }
          }
          
          // If all images used, just return the first valid one
          if (match.images[0]) {
            return match.images[0];
          }
        }
        
        // Fallback based on time of day if no matches
        const timeOfDay = (activity.bestTime || '').toLowerCase();
        if (timeOfDay.includes('am') || timeOfDay.includes('morning')) {
          return timeOfDayImages.morning;
        } else if (timeOfDay.includes('pm') && parseInt((activity.bestTime || '0:00').split(':')[0]) < 6) {
          return timeOfDayImages.afternoon;
        } else {
          return timeOfDayImages.evening;
        }
      };

    // Function to create reliable Google Maps link
    const createGoogleMapsLink = (activity) => {
        const searchQuery = encodeURIComponent(`${activity.activity} ${destination}`);
        return `https://www.google.com/maps/search/${searchQuery}`;
    };

    // Function to create TripAdvisor search link
    const createTripAdvisorLink = (activity) => {
        const searchQuery = encodeURIComponent(`${activity.activity} ${destination}`);
        return `https://www.tripadvisor.com/Search?q=${searchQuery}`;
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto">
            

            {/* Day selector tabs */}
            <div className="flex overflow-x-auto mb-6 pb-2 scrollbar-hide">
                {dayKeys.map((day, index) => (
                    <button
                    key={day}
                    onClick={() => setSelectedDay(index + 1)}
                    className={`px-6 py-3 rounded-full mr-3 whitespace-nowrap transition-all ${selectedDay === index + 1
                            ? 'bg-blue-600 text-white font-medium'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                    style={{ direction: isRTL ? "rtl" : "ltr" }}
                >
                    {translate("activitiesSection.day")} {index + 1}
                </button>
                ))}
            </div>

            {/* Activities for selected day */}
            {dayKeys.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trip?.tripData?.itinerary[`day${selectedDay}`]?.map((activity, index) => (
                        <div
                            key={index}
                            className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                        >
                            {/* Activity image */}
                            <div className="h-56 overflow-hidden relative">
                                {loadingImages[`${selectedDay}_${activity.activity}`] && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                )}
                                <img 
    src={getImageForActivity(activity, index)} 
    alt={activity.activity}
    className="w-full h-full object-cover"
    onError={(e) => {
        e.target.onerror = null;
        e.target.src = fallbackImage;
    }}
    loading="lazy"
/>
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                                
                                {/* Time badge */}
                                <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                                    {activity.bestTime}
                                </div>
                                
                                {/* Activity title overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">{activity.activity}</h3>
                                </div>
                            </div>

                            {/* Activity content */}
                            <div className="p-5">
                                <div className="text-gray-400 text-sm mb-5 line-clamp-3">
                                    <div className="flex flex-wrap gap-2 mb-1">
                                        {activity.duration && (
                                            <span className="bg-gray-800/80 text-gray-200 px-2 py-1 rounded-md text-xs flex items-center backdrop-blur-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {activity.duration}
                                            </span>
                                        )}
                                        
                                        {activity.travelTime && (
                                            <span className="bg-gray-800/80 text-gray-200 px-2 py-1 rounded-md text-xs flex items-center backdrop-blur-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                                {activity.travelTime}
                                            </span>
                                        )}
                                        
                                        {activity.price && (
                                            <span className="bg-gray-800/80 text-gray-200 px-2 py-1 rounded-md text-xs flex items-center backdrop-blur-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {activity.price}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Booking links */}
                                <div className="flex flex-wrap gap-2">
                                    {/* Only show official site button if we have a valid URL */}
                                    {activity.bookingLinks?.official &&
                                        activity.bookingLinks.official.startsWith('http') && (
                                            <a
                                                href={activity.bookingLinks.official}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                                                style={{ direction: isRTL ? "rtl" : "ltr" }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                                                </svg>
                                                {translate("activitiesSection.bookNow")}
                                            </a>
                                        )}

                                    {/* Always show Google Maps button with reliable link */}
                                    <a
                                        href={createGoogleMapsLink(activity)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
    style={{ direction: isRTL ? "rtl" : "ltr" }}
>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    {translate("activitiesSection.viewMap")}
</a>

                                                                        {/* Always show TripAdvisor button with reliable link */}
                                                                        <a
                                        href={createTripAdvisorLink(activity)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
    style={{ direction: isRTL ? "rtl" : "ltr" }}
>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
    {translate("activitiesSection.reviews")}
</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {(!dayKeys.length || !trip?.tripData?.itinerary[`day${selectedDay}`]?.length) && (
                <div className="bg-gray-800 rounded-xl p-8 text-center" style={{ direction: isRTL ? "rtl" : "ltr" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <h3 className="text-xl font-medium text-white mb-2">{translate("activitiesSection.noActivities")}</h3>
                <p className="text-gray-400">{translate("activitiesSection.noActivitiesDesc")}</p>
            </div>
            )}
        </div>
    );
}

export default Activities;