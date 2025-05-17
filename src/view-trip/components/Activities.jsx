import React, { useState, useEffect } from 'react';
import { useLanguage } from "@/context/LanguageContext";

// Collection of activity images by category
const activityImageData = {
    // Adventure Activities
    adventure: {
        // Ziplining & Aerial Activities
        "zipline": [
           "https://images.unsplash.com/photo-1692205959816-d75d4a7b89d4?q=80&w=2133&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
           "https://images.unsplash.com/photo-1648853070657-6d58398bee93?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
           "https://images.unsplash.com/photo-1640278838346-8b243bafa199?q=80&w=1928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "ziplining": [
            "https://images.unsplash.com/photo-1692205959816-d75d4a7b89d4?q=80&w=2133&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1648853070657-6d58398bee93?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "paragliding": [
            "https://images.unsplash.com/photo-1592208128295-5aaa34f1d72b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1694811401894-59f6a0f5237e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "skydiving": [
            "https://images.unsplash.com/photo-1521673252667-e05da380b252?auto=format&fit=crop&w=1200",
            "",
        ],
        "bungee": [
            "https://images.unsplash.com/photo-1549221360-456a9c197d5b?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
           "https://images.unsplash.com/photo-1497470888337-ded683b67494?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "helicopter": [
            "https://images.unsplash.com/photo-1495554698253-681539e9ea84?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1579118559062-39e94a22dbb8?q=80&w=2012&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "air balloon":["https://images.unsplash.com/photo-1522943854798-7ea1c5464eba?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
        "cable car":["https://images.unsplash.com/photo-1579699806448-2c59418850ae?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],

        // Hiking & Mountain Activities
        "hike": [
            "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200",
            "https://images.unsplash.com/uploads/141148589884100082977/a816dbd7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "hiking": [
            "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200",
            "https://images.unsplash.com/photo-1502126324834-38f8e02d7160?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "trek": [
            "https://images.unsplash.com/photo-1545652985-5edd365b12eb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "trekking": [
            "https://images.unsplash.com/photo-1545652985-5edd365b12eb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "trail": [
            "https://images.unsplash.com/photo-1456613820599-bfe244172af5?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1498581444814-7e44d2fbe0e2?q=80&w=1998&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "mountain": [
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200",
            
        ],
        "climbing": [
            "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1200",
            "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?q=80&w=2144&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            
        ],
        "rock climbing": [
            "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=2003&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1516372048654-2e06f99e1382?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "mountaineering": [
            "https://images.unsplash.com/photo-1478255940606-20f49a495e8d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
           "https://images.unsplash.com/photo-1611154046036-cd91e50978be?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "summit": [
            "https://images.unsplash.com/photo-1534685785745-60a2cea0ec34?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
           "https://images.unsplash.com/photo-1524281423221-234569bc0438?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "volcano": [
            "https://images.unsplash.com/photo-1619266465172-02a857c3556d?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1580250642511-1660fe42ad58?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],

        // Animal & Wildlife Activities
        "safari": [
            "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200",
            
        ],
        "wildlife": [
            "https://images.unsplash.com/photo-1504173010664-32509aeebb62?auto=format&fit=crop&w=1200",
            
        ],
        "horseback": [
            "https://images.unsplash.com/photo-1609128231746-356e747a53bc?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
           "https://images.unsplash.com/photo-1566673186995-e3f5e6fbaf80?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "horseback riding": [
            "https://images.unsplash.com/photo-1609128231746-356e747a53bc?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
           "https://images.unsplash.com/photo-1566673186995-e3f5e6fbaf80?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "riding": [
            "https://images.unsplash.com/photo-1613937104241-1fdd18aeb908?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
           "https://images.unsplash.com/photo-1678026038177-74330c556d20?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "animal": [
            "https://images.unsplash.com/photo-1591824438708-ce405f36ba3d?auto=format&fit=crop&w=1200",
            "https://images.unsplash.com/photo-1548506446-86bfddac5620?auto=format&fit=crop&w=1200"
        ],
        "birdwatching": [
            "https://images.unsplash.com/photo-1621612630169-ce3c95582b3b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1621070668993-148f3364642f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "dolphin": [
            "https://images.unsplash.com/photo-1607153333879-c174d265f1d2?auto=format&fit=crop&w=1200",
           
        ],
        "whale": [
            "https://images.unsplash.com/photo-1568430462989-44163eb1752f?auto=format&fit=crop&w=1200",
    
        ],
        "canyoning": 
        ["https://images.unsplash.com/photo-1690291900903-1bf8f6f54c50?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
             "https://images.unsplash.com/photo-1689180983514-ebd9b1e4ba1b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],

        "sandboarding": 
        ["https://images.unsplash.com/photo-1643856545126-a20f97392fc9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1729946713976-8734076e49ea?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
            
        "wingsuit": 
        ["https://images.unsplash.com/photo-1533652475678-12f52b4fdd53?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1696085084339-1e2df9609385?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
            
        "hang gliding": 
        ["https://images.unsplash.com/photo-1551891587-d8e5ce1731f1?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1551891588-73c0bf66be48?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
            
        "ice climbing": 
        ["https://images.unsplash.com/photo-1548789997-82da68437ad8?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1647601294667-5a5948b6cd93?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
            
        "via ferrata": 
        ["https://images.unsplash.com/photo-1545212586-f25d3631b77f?q=80&w=2067&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1543688531-441b5e0d2004?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
            
        "caving":
         ["https://images.unsplash.com/photo-1600201319330-e99245e614c5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1628746404106-4d3843b231b3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
            
        "spelunking": 
        ["https://images.unsplash.com/photo-1702064874499-c9fc28b2d9d7?q=80&w=1930&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1702064874499-c9fc28b2d9d7?q=80&w=1930&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
            
        "rappelling":
         ["https://images.unsplash.com/photo-1696347191385-cb5d068bdca9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1696347191385-cb5d068bdca9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
            
        "zorbing": 
        ["https://images.unsplash.com/photo-1661779062990-73c2d9cb58e5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""],
            
    },

    // Water Activities
    water: {
        // Beach Activities
        "beach club":["https://images.unsplash.com/photo-1662950267280-0cdf5f7139b4?q=80&w=2094&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
        "beach": [
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "beachfront": [
            "https://images.unsplash.com/photo-1622396090075-ab6b8396fe9b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "shore": [
            "https://images.unsplash.com/photo-1525154199452-245d16abd9fe?q=80&w=1933&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "coast":  [
            "https://images.unsplash.com/photo-1433567212640-211efabc03e1?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "picnic":  [
            "https://images.unsplash.com/photo-1578359968130-76b59bb5af13?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "sunset": [
            "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        // Water Sports
        "surf":  [
            "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1459745930869-b3d0d72c3cbb?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "surfing":  [
            "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1459745930869-b3d0d72c3cbb?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "swimming":  [
            "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?q=80&w=2050&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "swim":  [
            "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?q=80&w=2050&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],

        "snorkel": [
            "https://images.unsplash.com/photo-1621432253147-464524b9eaa1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1664922114319-4700c0ef74b1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
            
        "snorkeling": [
            "https://images.unsplash.com/photo-1621432253147-464524b9eaa1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1664922114319-4700c0ef74b1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
            
        "dive":  [
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1682687982502-1529b3b33f85?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
            
        "diving":  [
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1682687982502-1529b3b33f85?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
            
        "scuba":  [
            "https://images.unsplash.com/photo-1682687981922-7b55dbb30892?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1682686581030-7fa4ea2b96c3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
            
        "paddleboard": [
            "https://images.unsplash.com/photo-1514944137161-db35a1a43935?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1514944137161-db35a1a43935?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
            
        "kayak":  [
            "https://images.unsplash.com/photo-1480480565647-1c4385c7c0bf?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1588472235276-7638965471e2?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
            
        "kayaking":  [
            "https://images.unsplash.com/photo-1480480565647-1c4385c7c0bf?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1588472235276-7638965471e2?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
            
        "canoe": [
            "photo-1698338873280-c446cc6944bf?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1523287281576-5b596107a6ae?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
            
        "canoeing":  [
            "photo-1698338873280-c446cc6944bf?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1523287281576-5b596107a6ae?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
            
        "rafting":  [
            "https://images.unsplash.com/photo-1629248457649-b082812aea6c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1642933196504-62107dac9258?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
            
        "waterfall":  [
            "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
            

        // Marine & Sailing Activities
        "sea":  [
            "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
            
        "ocean":  [
            "https://images.unsplash.com/photo-1488278905738-514111aa236c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
            
        "boat": [
            "https://images.unsplash.com/photo-1520255870062-bd79d3865de7?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1559075479-e8da6f6fc3fb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
            
        "boating": [
            "https://images.unsplash.com/photo-1520255870062-bd79d3865de7?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1559075479-e8da6f6fc3fb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
            
        "cruise":  [
            "https://images.unsplash.com/photo-1589420241438-38271f7d3cea?q=80&w=1946&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1634847224877-9fe68ae54940?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
            
        "cruising": [
            "https://images.unsplash.com/photo-1589420241438-38271f7d3cea?q=80&w=1946&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1634847224877-9fe68ae54940?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
            
        "sailing":  [
            "https://images.unsplash.com/photo-1452065656801-6c60b6e7cbc5?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1526761122248-c31c93f8b2b9?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
            
        "yacht":  [
            "https://images.unsplash.com/photo-1562281302-809108fd533c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
            
        "catamaran":  [
            "https://images.unsplash.com/photo-1581271164789-7c97932822d3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
            
        "fishing":  [
            "https://images.unsplash.com/photo-1541742425281-c1d3fc8aff96?q=80&w=2012&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "museum": [
            "https://images.unsplash.com/photo-1554907984-15263bfd63bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1554907984-15263bfd63bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
            
        "maritime": [
            "https://images.unsplash.com/photo-1718314786551-798f1398a7b1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
            
        "harbor":  [
            "https://images.unsplash.com/photo-1582658170611-ef7975c4f0ff?q=80&w=1962&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
            
        "harbour": [
            "https://images.unsplash.com/photo-1582658170611-ef7975c4f0ff?q=80&w=1962&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
            
        "marina": [
            "https://images.unsplash.com/photo-1541777594744-addc2de9d110?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
            
        "wakeboarding":  [
            "https://images.unsplash.com/photo-1531001602318-1916852b9205?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "windsurfing":  [
            "https://images.unsplash.com/photo-1722847024325-7b75aa1e26fa?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1726735979221-b4b54efb139a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "jet skiing":  [
            "https://images.unsplash.com/photo-1660642481220-3b435d98759a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1721798974342-7b2b859493a0?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "flyboarding":  [
            "https://images.unsplash.com/photo-1505408990643-cb9bbf4bfe2c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1732243395390-2805b61d4af1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "paddling":  [
            "https://images.unsplash.com/photo-1523287281576-5b596107a6ae?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1591805021133-a0441817ea27?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "bodyboarding": [
            "https://images.unsplash.com/flagged/photo-1594743707995-0ba996d2bbb8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "freediving":  [
            "https://images.unsplash.com/photo-1603259860985-5dfe6bf9a1fd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "kite surfing":  [
            "https://images.unsplash.com/photo-1519399224017-87a75eb50df9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "pearl diving":  [
            "https://images.unsplash.com/photo-1727346646094-8d13afb384c1?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "white water": [
            "https://images.unsplash.com/photo-1561187708-6424a4a6c689?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
    },

    // Cultural & Urban Activities
    cultural: {
        // Museums & Art
        "museum": [
            "https://images.unsplash.com/photo-1554907984-15263bfd63bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1554907984-15263bfd63bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200",
            ""
        ],
        "art": [
            "https://images.unsplash.com/photo-1459908676235-d5f02a50184b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "exhibition": [
            "https://images.unsplash.com/photo-1621685743771-fd5e13734ae6?q=80&w=2053&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        // Historical Sites
        "castle": [
            "https://images.unsplash.com/photo-1449452198679-05c7fd30f416?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "palace":[
            "https://images.unsplash.com/photo-1549895058-36748fa6c6a7?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "cathedral": [
            "https://images.unsplash.com/photo-1585749176286-1d825e34fdae?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "church": [
            "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "temple": [
            "https://images.unsplash.com/photo-1603766806347-54cdf3745953?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "mosque":[
            "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "ruins": [
            "https://images.unsplash.com/photo-1559489110-40a90ee4e70a?q=80&w=2062&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1559489110-40a90ee4e70a?q=80&w=2062&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "historic": [
            "https://images.unsplash.com/photo-1579762593251-07c01abb6599?q=80&w=1933&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1579762593251-07c01abb6599?q=80&w=1933&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "monument": [
            "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "memorial": [
            "https://images.unsplash.com/photo-1720525056663-e55be8caaa4c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1720525056663-e55be8caaa4c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "archaeology": [
            "https://images.unsplash.com/photo-1613059312885-8a758073461b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "shopping":[
            "https://images.unsplash.com/photo-1481437156560-3205f6a55735?q=80&w=2095&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],

        // Urban Exploration
        "city":[
            "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "downtown": [
            "https://images.unsplash.com/photo-1696556009844-2d7ef3c3e116?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "urban": [
            "https://images.unsplash.com/photo-1487452066049-a710f7296400?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "skyline": [
            "https://images.unsplash.com/photo-1496588152823-86ff7695e68f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "architecture": [
            "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "shopping":[
            "https://images.unsplash.com/photo-1481437156560-3205f6a55735?q=80&w=2095&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "market": [
            "https://images.unsplash.com/photo-1576562331281-d09e46af9854?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "bazaar": [
            "https://images.unsplash.com/photo-1571060492916-93b251851ca5?q=80&w=2086&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "street": [
            "https://images.unsplash.com/photo-1482859454392-1b5326395032?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "walking": [
            "https://images.unsplash.com/photo-1506751470038-e579eb91f580?q=80&w=1928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "walking tour": [
            "https://images.unsplash.com/photo-1536607961765-592e80bcc19e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "tour":[
            "https://images.unsplash.com/photo-1512704515581-de233a09dae8?q=80&w=2120&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "guide": [
            "https://images.unsplash.com/photo-1600714480856-dc99b28892eb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],

        // Cultural Experiences
        "performance": [
            "https://images.unsplash.com/photo-1522694013927-350c454fa94b?q=80&w=2094&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "concert":[
            "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "theater": [
            "https://images.unsplash.com/photo-1562329265-95a6d7a83440?q=80&w=1970&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "cinema": [
            "https://images.unsplash.com/photo-1693173509659-98992bc44d09?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "movie": [
            "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "opera":[
            "https://images.unsplash.com/photo-1516307365426-bea591f05011?q=80&w=2059&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "ballet": [
            "https://images.unsplash.com/photo-1516737488405-7b6d6868fad3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "dance": [
            "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "festival": [
            "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "celebration": [
            "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "parade":[
            "https://images.unsplash.com/photo-1609051589207-264fb1f91000?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "cultural": [
            "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "traditional": [
            "https://images.unsplash.com/photo-1594717686871-e21e79229681?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "ceremony": [
            "https://images.unsplash.com/photo-1696204868916-cda7380ae72b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "amphitheater": [
            "https://images.unsplash.com/photo-1594592135972-13c757367680?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "poetry reading": [
            "https://images.unsplash.com/photo-1576238580501-f21ccaaa83ac?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "calligraphy": [
            "https://images.unsplash.com/photo-1546638008-efbe0b62c730?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "pottery making": [
            "https://images.unsplash.com/photo-1554638795-42c2bcd2533b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "weaving": [
            "https://images.unsplash.com/photo-1597371140946-cfd3dd5a76b9?q=80&w=2093&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "glass blowing": [
            "https://images.unsplash.com/photo-1506902039157-1a7e7374b077?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "street food": [
            "https://images.unsplash.com/photo-1552912470-ee2e96439539?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "night market": [
            "https://images.unsplash.com/photo-1535898331935-2d274aff0fbc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "lantern festival":[
            "https://images.unsplash.com/photo-1628024564458-b3dfcceb3f34?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],
        "traditional dance":[
            "https://images.unsplash.com/photo-1700324781657-bb71b4534ad0?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ""
        ],

    },

    // Food & Relaxation Activities
    lifestyle: {
        // Food & Drink
        "restaurant": [
            "52566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "departure":[
                "https://images.unsplash.com/photo-1490430657723-4d607c1503fc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "departure from":[
                "https://images.unsplash.com/photo-1490430657723-4d607c1503fc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "Ferry Transfer":[
                "https://images.unsplash.com/photo-1710661428083-2bdb61d37aaa?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "Ferry ":[
                "https://images.unsplash.com/photo-1676889128827-5f9a1f5d213b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        

        "travel to":[
                "https://images.unsplash.com/photo-1647286383067-6e2ae17e5b16?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "fly to":[
                "https://images.unsplash.com/photo-1647286383067-6e2ae17e5b16?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "railway":["https://images.unsplash.com/uploads/1413387158190559d80f7/6108b580?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
        "visit":["https://images.unsplash.com/photo-1495551759417-98076011672b?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
        "explore":["https://images.unsplash.com/photo-1603714196939-6f6436c8d0c5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
        "arrival":[
            "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ],
    "landing":[
        "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
],
        "check in":[
                "https://images.unsplash.com/photo-1553369728-15ec6971afaf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "check out":[
                "https://images.unsplash.com/photo-1589568365171-77cdf21d2ed6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ],
        "dining": [
            "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "dinner": [
            "https://images.unsplash.com/photo-1536392706976-e486e2ba97af?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "lunch":[
            "https://images.unsplash.com/photo-1576867757603-05b134ebc379?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "Lunch at":[
            "https://images.unsplash.com/photo-1576867757603-05b134ebc379?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "breakfast":[
            "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "food":[
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "meal": [
            "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "culinary": [
            "https://images.unsplash.com/photo-1594046243098-0fceea9d451e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "tasting": [
            "https://images.unsplash.com/photo-1561986863-60b73438b5c1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "cooking": [
            "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "class": [
            "https://images.unsplash.com/photo-1683624328172-88fb24625ec1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "cooking class": [
            "https://images.unsplash.com/photo-1683624328172-88fb24625ec1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "wine": [
            "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "winery": [
            "https://images.unsplash.com/photo-1572913017567-02f0649bc4fd?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "vineyard": [
            "https://images.unsplash.com/photo-1558138818-34316d616e44?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "brewery": [
            "https://images.unsplash.com/photo-1555658636-6e4a36218be7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "beer":[
            "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "bar": [
            "https://images.unsplash.com/photo-1597290282695-edc43d0e7129?q=80&w=2075&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "cafe":[
            "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "coffee":[
            "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1937&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],

        // Wellness & Relaxation
        "spa": [
            "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "massage": [
            "https://images.unsplash.com/photo-1611073615452-4889cb93422e?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "wellness": [
            "https://images.unsplash.com/photo-1535914254981-b5012eebbd15?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "relaxation": [
            "https://images.unsplash.com/photo-1559414131-b0aa53919648?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "hot spring": [
            "https://images.unsplash.com/photo-1470010762743-1fa2363f65ca?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "thermal": [
            "https://images.unsplash.com/photo-1500163638764-6f9378de0c8d?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "bath":[
            "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "onsen":[
            "https://images.unsplash.com/photo-1644413638617-02369c89c156?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "yoga": [
            "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "meditation":[
            "https://images.unsplash.com/photo-1559595500-e15296bdbb48?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "mindfulness":[
            "https://images.unsplash.com/photo-1592895792095-85fa785192a9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
        "retreat": [
            "https://images.unsplash.com/photo-1517363898874-737b62a7db91?q=80&w=1963&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "",
        ],
    },

    // Nature & Landscape
    nature: {
        // Natural Landscapes
        "forest": [
            "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "rainforest": [
            "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "island": [
            "https://images.unsplash.com/photo-1502085671122-2d218cd434e6?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "woods": [
            "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "park": [
            "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "garden":[
            "https://images.unsplash.com/photo-1601654253194-260e0b6984f9?q=80&w=1999&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "botanical":[
            "https://images.unsplash.com/photo-1466781783364-36c955e42a7f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "field":[
            "https://images.unsplash.com/photo-1498408040764-ab6eb772a145?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "meadow": [
            "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "valley": [
            "https://images.unsplash.com/photo-1531252582519-2d7e6795be96?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "river": [
            "https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "lake": [
            "https://images.unsplash.com/photo-1439066290691-510066268af5?q=80&w=1973&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "cave": [
            "https://images.unsplash.com/photo-1560403442-d141ff60800d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "canyon": [
            "https://images.unsplash.com/photo-1460302293840-dc1a23a7b226?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "desert": [
            "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "dune": [
            "https://images.unsplash.com/photo-1488197047962-b48492212cda?q=80&w=2067&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "beach": [
            "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "countryside":[
            "https://images.unsplash.com/photo-1588152850700-c82ecb8ba9b1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "landscape": [
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],

        // Celestial & Weather Events
        "astronomy": [
            "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2113&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "stargazing": [
            "https://images.unsplash.com/photo-1527871899604-f1425bcce779?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "northern lights": [
            "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "aurora": [
            "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "sunrise": [
            "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "sunset": [
            "https://images.unsplash.com/photo-1481988535861-271139e06469?q=80&w=2090&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "rainbow":[
            "https://images.unsplash.com/photo-1593362831502-5c3ad1c05f57?q=80&w=2012&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "fjord": [
            "https://images.unsplash.com/photo-1673219498962-26df0c20dd97?q=80&w=2060&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "geyser":[
            "https://images.unsplash.com/photo-1554748794-953974aa06da?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "salt flat": [
            "https://images.unsplash.com/photo-1621315892013-f32af7358947?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "mangrove": [
            "https://images.unsplash.com/photo-1589556183130-530470785fab?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "glacier":[
            "https://images.unsplash.com/photo-1494564605686-2e931f77a8e2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "reef": [
            "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "coral": [
            "https://images.unsplash.com/photo-1546026423-cc4642628d2b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "wetland":[
            "https://images.unsplash.com/photo-1528732262645-b06fa3a79c9e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "savanna": [
            "https://images.unsplash.com/photo-1535940360221-641a69c43bac?q=80&w=2066&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        "tundra": [
            "https://images.unsplash.com/photo-1670517301637-80f59360282b?q=80&w=1967&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
    },

    // Sports & Recreation
    sports: {
        // Various Sports
        "golf":  ["https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",],

        "tennis":  ["https://images.unsplash.com/flagged/photo-1576972405668-2d020a01cbfa?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",],

        "skiing":  ["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",],

        "snowboarding":  ["https://images.unsplash.com/photo-1518608774889-b04d2abe7702?q=80&w=2012&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",],

        "biking": ["https://images.unsplash.com/photo-1576858574144-9ae1ebcf5ae5?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",],

        "cycling":  ["https://images.unsplash.com/photo-1600403477955-2b8c2cfab221?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",],

        "running": ["https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",],

        "basketball": ["https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",],

        "football": ["https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=1926&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",],

        "soccer": ["https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1986&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",],

        "volleyball":  ["https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=2014&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",],

        "baseball":  ["https://images.unsplash.com/photo-1529768167801-9173d94c2a42?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",],

        "hockey":  ["https://images.unsplash.com/photo-1545471977-94cac22e71ed?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",],

        "surfing":  ["https://images.unsplash.com/photo-1530870110042-98b2cb110834?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",],

        "archery": ["https://images.unsplash.com/photo-1641531105535-1ead3c1784ab?q=80&w=2011&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],

        "axe throwing": ["https://images.unsplash.com/photo-1670011021674-1078f41ef4a2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],

        "parkour": ["https://images.unsplash.com/photo-1495160101476-62b90f5fc1c1?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],

        "rock wall": ["https://images.unsplash.com/photo-1513083457273-8ea7b2a045c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],

        "bouldering": ["https://images.unsplash.com/photo-1564769662533-4f00a87b4056?q=80&w=2144&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],

        "fencing": ["https://images.unsplash.com/photo-1505619656705-59ebc350b547?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],

        "martial arts": ["https://images.unsplash.com/photo-1555597408-26bc8e548a46?q=80&w=2123&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],

        "trampoline": ["https://images.unsplash.com/photo-1632163570616-8699e344f486?q=80&w=2026&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],

        "skateboarding": ["https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],

        "roller skating": ["https://images.unsplash.com/photo-1692150972658-6f7a54122676?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
    },
    // New category: Wellness & Mindfulness
    wellness: {
        "acupuncture": ["https://images.unsplash.com/photo-1598555763574-dca77e10427e?q=80&w=2097&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",],

        "sound healing": ["https://images.unsplash.com/photo-1593810451410-8fbb422cc15e?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],

        "forest bathing": ["https://images.unsplash.com/photo-1606825004533-dbfb13be4cb5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],

        "tai chi": ["https://images.unsplash.com/photo-1576237652526-111d7669d9cc?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],

        "aromatherapy": ["https://images.unsplash.com/photo-1492552181161-62217fc3076d?q=80&w=2097&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],

        "crystal healing": ["https://images.unsplash.com/photo-1567113463224-37cf03ba4577?q=80&w=2051&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],

        "reiki": ["https://images.unsplash.com/photo-1562026700-3425431ecb5b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],

        "flotation tank": ["https://images.unsplash.com/photo-1605158743762-f887b36eef11?q=80&w=1956&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],

        "mud bath": ["https://images.unsplash.com/photo-1631801754345-8b998163dc1d?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],


    },

    // New category: Educational Activities
    educational: {
        "astronomy class": ["https://images.unsplash.com/photo-1743147177981-2ae6f1f97e2a?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
        "cooking workshop": ["https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
        "wine tasting": ["https://images.unsplash.com/photo-1558670460-cad0c19b1840?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
        "tea ceremony": ["https://images.unsplash.com/photo-1613217138844-1dae03c64d89?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
        "perfume making": ["https://images.unsplash.com/photo-1709660274859-7f1b42c2c3fa?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
        "chocolate making": ["https://images.unsplash.com/photo-1590080875852-ba44f83ff2db?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
        "bread baking": ["https://images.unsplash.com/photo-1630329777937-e0de732a893c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
        "cheese making": ["https://images.unsplash.com/photo-1663841365334-06805f34af15?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
        "craft workshop": ["https://images.unsplash.com/photo-1513785077084-84adb77e90ab?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
        "language class": ["https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""]
    },

    // New category: Agricultural & Rural
    rural: {
        "farm stay": ["https://images.unsplash.com/photo-1679984743122-82e0f372e748?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
        "olive harvesting": ["https://images.unsplash.com/photo-1592069200809-90266ffaf0f5?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
        "grape picking": ["https://images.unsplash.com/photo-1727063186730-eb555baaf039?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
        "beekeeping": ["https://images.unsplash.com/photo-1647427060148-ea2b8f7c6bb3?q=80&w=2013&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
        "truffle hunting": ["https://images.unsplash.com/photo-1589208310452-7cf38ba4d109?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
        "rice farming": ["https://images.unsplash.com/photo-1593442809186-35c768d100d3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
        "organic farming": ["https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
        "sheep herding": ["https://images.unsplash.com/photo-1511771426841-8119ef5f32fd?q=80&w=2022&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
        "maple tapping": ["https://images.unsplash.com/photo-1713700878349-ff78b22a640e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""],
        "lavender field": ["https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", ""]
    }
};

// Default images based on time of day
const timeOfDayImages = {
  "morning": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200",
  "afternoon": "https://images.unsplash.com/photo-1709442956059-5bc5b601624e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "evening": "https://images.unsplash.com/photo-1504261025028-554905831f45?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
            const activities = trip.tripData.itinerary[`day${selectedDay}`];
            activities.forEach(activity => {
                const activityId = `${selectedDay}_${activity.activity}`;
                setLoadingImages(prev => ({
                    ...prev,
                    [activityId]: false
                }));
            });
        }
    }, [selectedDay, trip]);


    // const getImageForActivity = (activity) => {

    //     const activityText = `${activity.activity} ${activity.description || ''}`.toLowerCase();
    //     console.log('Processing:', activityText);
    
    //     // Helper function to find longest matching keyword
    //     const findLongestMatch = (text) => {
    //         let longestMatch = {
    //             keyword: '',
    //             category: '',
    //             images: null
    //         };
    
    //         // Go through each category
    //         for (const category in activityImageData) {
    //             // Check each keyword in the category
    //             for (const [keyword, images] of Object.entries(activityImageData[category])) {
    //                 // If this keyword is in the text and longer than our current match
    //                 if (text.includes(keyword.toLowerCase()) && 
    //                     keyword.length > longestMatch.keyword.length) {
    //                     longestMatch = {
    //                         keyword,
    //                         category,
    //                         images
    //                     };
    //                 }
    //             }
    //         }
    
    //         return longestMatch;
    //     };
    
    //     // Find the best match
    //     const match = findLongestMatch(activityText);
    //     console.log('Found match:', match.keyword, 'in category:', match.category);
    
    //     // If we found a match, use it
    //     if (match.images && match.images.length > 0) {
    //         return match.images[0];
    //     }
    
    //     // Fallback to time-based images
    //     const hour = parseInt(activity.bestTime?.split(':')[0] || '12');
    //     if (hour >= 5 && hour < 12) {
    //         return timeOfDayImages.morning;
    //     } else if (hour >= 12 && hour < 17) {
    //         return timeOfDayImages.afternoon;
    //     } else {
    //         return timeOfDayImages.evening;
    //     }
    // };

    // Function to create reliable Google Maps link
    
    const buildDirectMatchMap = (destination = '') => {
        // Normalize and prepare destination string
        const lowercaseDestination = destination.toLowerCase();
        
        // Initialize the direct match map
        const directMatchMap = {};
        
        // Common activities across all destinations
        const commonActivities = {
            // Water activities
            "snorkeling": activityImageData.water.snorkeling?.[0] || fallbackImage,
            "swimming": activityImageData.water.swimming?.[0] || fallbackImage,
            "diving": activityImageData.water.diving?.[0] || fallbackImage,
            "scuba diving": activityImageData.water.diving?.[0] || fallbackImage,
            "surfing": activityImageData.water.surfing?.[0] || fallbackImage,
            "surf lesson": activityImageData.water.surfing?.[0] || fallbackImage,
            "paddleboarding": activityImageData.water.paddleboard?.[0] || fallbackImage,
            "stand-up paddleboarding": activityImageData.water.paddleboard?.[0] || fallbackImage,
            "rafting": activityImageData.water.rafting?.[0] || fallbackImage,
            "boat tour": activityImageData.water.boat?.[0] || fallbackImage,
            "island tour": activityImageData.water.boat?.[0] || fallbackImage,
            "kayaking": activityImageData.water.kayaking?.[0] || fallbackImage,
            "canoeing": activityImageData.water.canoeing?.[0] || fallbackImage,
            "fishing": activityImageData.water.fishing?.[0] || fallbackImage,
            "whale watching": activityImageData.adventure.whale?.[0] || fallbackImage,
            "dolphin watching": activityImageData.adventure.dolphin?.[0] || fallbackImage,
            "jet skiing": activityImageData.water["jet skiing"]?.[0] || fallbackImage,
            "sailing": activityImageData.water.sailing?.[0] || fallbackImage,
            "cruise": activityImageData.water.cruise?.[0] || fallbackImage,
            
            // Beach and coastal activities
            "beach day": activityImageData.water.beach?.[0] || fallbackImage,
            "beach exploration": activityImageData.water.beach?.[0] || fallbackImage,
            "beach visit": activityImageData.water.beach?.[0] || fallbackImage,
            "coastline tour": activityImageData.water.coast?.[0] || fallbackImage,
            "sunset viewing": activityImageData.water.sunset?.[0] || activityImageData.nature.sunset?.[0] || fallbackImage,
            "sunset cruise": activityImageData.water.sunset?.[0] || activityImageData.water.cruise?.[0] || fallbackImage,
            
            // Land adventures
            "horseback riding": activityImageData.adventure.horseback?.[0] || fallbackImage,
            "hiking": activityImageData.adventure.hiking?.[0] || fallbackImage,
            "trekking": activityImageData.adventure.trekking?.[0] || fallbackImage,
            "mountain biking": activityImageData.sports.cycling?.[0] || fallbackImage,
            "rock climbing": activityImageData.adventure["rock climbing"]?.[0] || activityImageData.adventure.climbing?.[0] || fallbackImage,
            "zip lining": activityImageData.adventure.zipline?.[0] || fallbackImage,
            "ziplining": activityImageData.adventure.zipline?.[0] || fallbackImage,
            "zipline": activityImageData.adventure.zipline?.[0] || fallbackImage,
            "bungee jumping": activityImageData.adventure.bungee?.[0] || fallbackImage,
            "bungy jumping": activityImageData.adventure.bungee?.[0] || fallbackImage,
            "paragliding": activityImageData.adventure.paragliding?.[0] || fallbackImage,
            "skydiving": activityImageData.adventure.skydiving?.[0] || fallbackImage,
            "safari": activityImageData.adventure.safari?.[0] || fallbackImage,
            "wildlife viewing": activityImageData.adventure.wildlife?.[0] || fallbackImage,
            "wildlife safari": activityImageData.adventure.safari?.[0] || fallbackImage,
            "birdwatching": activityImageData.adventure.birdwatching?.[0] || fallbackImage,
            "canyoning": activityImageData.adventure.canyoning?.[0] || fallbackImage,
            "sandboarding": activityImageData.adventure.sandboarding?.[0] || fallbackImage,
            "caving": activityImageData.adventure.caving?.[0] || fallbackImage,
            "cave exploration": activityImageData.nature.cave?.[0] || activityImageData.adventure.caving?.[0] || fallbackImage,
            
            // Food & dining
            "dinner": activityImageData.lifestyle.dinner?.[0] || fallbackImage,
            "lunch": activityImageData.lifestyle.lunch?.[0] || fallbackImage,
            "breakfast": activityImageData.lifestyle.breakfast?.[0] || fallbackImage,
            "farewell dinner": activityImageData.lifestyle.dinner?.[0] || fallbackImage,
            "welcome dinner": activityImageData.lifestyle.dinner?.[0] || fallbackImage,
            "food tour": activityImageData.lifestyle.food?.[0] || fallbackImage,
            "cooking class": activityImageData.lifestyle["cooking class"]?.[0] || fallbackImage,
            "wine tasting": activityImageData.educational["wine tasting"]?.[0] || activityImageData.lifestyle.wine?.[0] || fallbackImage,
            "beer tasting": activityImageData.lifestyle.beer?.[0] || fallbackImage,
            "brewery tour": activityImageData.lifestyle.brewery?.[0] || fallbackImage,
            "café visit": activityImageData.lifestyle.cafe?.[0] || fallbackImage,
            "coffee shop": activityImageData.lifestyle.coffee?.[0] || fallbackImage,
            
            // Markets & shopping
            "night market": activityImageData.cultural["night market"]?.[0] || activityImageData.cultural.market?.[0] || fallbackImage,
            "market visit": activityImageData.cultural.market?.[0] || fallbackImage,
            "shopping": activityImageData.cultural.shopping?.[0] || fallbackImage,
            "bazaar": activityImageData.cultural.bazaar?.[0] || fallbackImage,
            "souvenir shopping": activityImageData.cultural.shopping?.[0] || fallbackImage,
            
            // Urban & city exploration
            "city tour": activityImageData.cultural.city?.[0] || fallbackImage,
            "walking tour": activityImageData.cultural.walking?.[0] || fallbackImage,
            "sightseeing": activityImageData.cultural.tour?.[0] || fallbackImage,
            "guided tour": activityImageData.cultural.tour?.[0] || fallbackImage,
            "architecture tour": activityImageData.cultural.architecture?.[0] || fallbackImage,
            "skyline view": activityImageData.cultural.skyline?.[0] || fallbackImage,
            
            // Cultural activities
            "museum visit": activityImageData.cultural.museum?.[0] || fallbackImage,
            "art gallery": activityImageData.cultural.gallery?.[0] || fallbackImage, 
            "temple visit": activityImageData.cultural.temple?.[0] || fallbackImage,
            "church visit": activityImageData.cultural.church?.[0] || fallbackImage,
            "mosque visit": activityImageData.cultural.mosque?.[0] || fallbackImage,
            "cathedral visit": activityImageData.cultural.cathedral?.[0] || fallbackImage,
            "historic site": activityImageData.cultural.historic?.[0] || fallbackImage,
            "ruins": activityImageData.cultural.ruins?.[0] || fallbackImage,
            "archaeological site": activityImageData.cultural.archaeology?.[0] || fallbackImage,
            "cultural show": activityImageData.cultural.performance?.[0] || fallbackImage,
            "traditional dance": activityImageData.cultural["traditional dance"]?.[0] || fallbackImage,
            "festival": activityImageData.cultural.festival?.[0] || fallbackImage,
            "cultural experience": activityImageData.cultural.cultural?.[0] || fallbackImage,
            "ceremony": activityImageData.cultural.ceremony?.[0] || fallbackImage,
            
            // Nature & landscapes
            "national park": activityImageData.nature.park?.[0] || fallbackImage,
            "garden": activityImageData.nature.garden?.[0] || fallbackImage,
            "botanical garden": activityImageData.nature.botanical?.[0] || fallbackImage,
            "waterfall": activityImageData.water.waterfall?.[0] || fallbackImage,
            "lake": activityImageData.nature.lake?.[0] || fallbackImage,
            "river cruise": activityImageData.nature.river?.[0] || activityImageData.water.cruise?.[0] || fallbackImage,
            "forest walk": activityImageData.nature.forest?.[0] || fallbackImage,
            "nature trail": activityImageData.adventure.trail?.[0] || fallbackImage,
            "canyon": activityImageData.nature.canyon?.[0] || fallbackImage,
            "desert": activityImageData.nature.desert?.[0] || fallbackImage,
            "stargazing": activityImageData.nature.stargazing?.[0] || fallbackImage,
            "aurora viewing": activityImageData.nature.aurora?.[0] || fallbackImage,
            "northern lights": activityImageData.nature["northern lights"]?.[0] || fallbackImage,
            "glacier": activityImageData.nature.glacier?.[0] || fallbackImage,
            "hot spring": activityImageData.lifestyle["hot spring"]?.[0] || fallbackImage,
            "thermal bath": activityImageData.lifestyle.thermal?.[0] || fallbackImage,
            
            // Sports & recreation
            "golf": activityImageData.sports.golf?.[0] || fallbackImage,
            "tennis": activityImageData.sports.tennis?.[0] || fallbackImage,
            "skiing": activityImageData.sports.skiing?.[0] || fallbackImage,
            "snowboarding": activityImageData.sports.snowboarding?.[0] || fallbackImage,
            "running": activityImageData.sports.running?.[0] || fallbackImage,
            "yoga": activityImageData.lifestyle.yoga?.[0] || fallbackImage,
            "meditation": activityImageData.lifestyle.meditation?.[0] || fallbackImage,
            
            // Wellness & relaxation
            "spa": activityImageData.lifestyle.spa?.[0] || fallbackImage,
            "massage": activityImageData.lifestyle.massage?.[0] || fallbackImage,
            "wellness": activityImageData.lifestyle.wellness?.[0] || fallbackImage,
            "relaxation": activityImageData.lifestyle.relaxation?.[0] || fallbackImage,
            "retreat": activityImageData.lifestyle.retreat?.[0] || fallbackImage,
            "tai chi": activityImageData.wellness["tai chi"]?.[0] || fallbackImage,
            "sound healing": activityImageData.wellness["sound healing"]?.[0] || fallbackImage,
            "aromatherapy": activityImageData.wellness.aromatherapy?.[0] || fallbackImage,
            
            // Educational activities
            "cooking workshop": activityImageData.educational["cooking workshop"]?.[0] || fallbackImage,
            "language class": activityImageData.educational["language class"]?.[0] || fallbackImage,
            "craft workshop": activityImageData.educational["craft workshop"]?.[0] || fallbackImage,
            "pottery making": activityImageData.cultural["pottery making"]?.[0] || fallbackImage,
            "weaving": activityImageData.cultural.weaving?.[0] || fallbackImage,
            "glass blowing": activityImageData.cultural["glass blowing"]?.[0] || fallbackImage,
            
            // Rural & agricultural
            "farm visit": activityImageData.rural["farm stay"]?.[0] || fallbackImage,
            "organic farming": activityImageData.rural["organic farming"]?.[0] || fallbackImage,
            "beekeeping": activityImageData.rural.beekeeping?.[0] || fallbackImage,
            "olive harvesting": activityImageData.rural["olive harvesting"]?.[0] || fallbackImage,
            "grape picking": activityImageData.rural["grape picking"]?.[0] || fallbackImage,
            "vineyard tour": activityImageData.lifestyle.vineyard?.[0] || fallbackImage,
            "winery tour": activityImageData.lifestyle.winery?.[0] || fallbackImage
        };
        
        // Add all common activities to the direct match map
        Object.assign(directMatchMap, commonActivities);
        
        // Destination-specific activity mappings
        const destinationMappings = {
            // Nepal related
            "nepal": {
                "annapurna": activityImageData.adventure.trekking?.[0] || fallbackImage,
                "everest": activityImageData.adventure.trekking?.[0] || fallbackImage,
                "everest base camp": activityImageData.adventure.trekking?.[0] || fallbackImage,
                "thamel": activityImageData.cultural.city?.[0] || fallbackImage,
                "chitwan": activityImageData.adventure.safari?.[0] || fallbackImage,
                "pokhara": activityImageData.nature.lake?.[0] || fallbackImage,
                "phewa lake": activityImageData.nature.lake?.[0] || fallbackImage,
                "nagarkot sunrise": activityImageData.nature.sunrise?.[0] || fallbackImage,
                "durbar square": activityImageData.cultural.historic?.[0] || fallbackImage,
                "patan": activityImageData.cultural.temple?.[0] || fallbackImage,
                "bhaktapur": activityImageData.cultural.historic?.[0] || fallbackImage,
                "pashupati": activityImageData.cultural.temple?.[0] || fallbackImage,
                "bungee jumping at the last resort": activityImageData.adventure.bungee?.[0] || fallbackImage,
                "white water rafting on the trishuli river": activityImageData.water.rafting?.[0] || fallbackImage,
                "mountain flight": activityImageData.adventure.helicopter?.[0] || fallbackImage
            },
            
            // Thailand related
            "thailand": {
                "grand palace": activityImageData.cultural.palace?.[0] || fallbackImage,
                "wat pho": activityImageData.cultural.temple?.[0] || fallbackImage,
                "ayutthaya": activityImageData.cultural.ruins?.[0] || fallbackImage,
                "chatuchak": activityImageData.cultural.market?.[0] || fallbackImage,
                "phi phi": activityImageData.water.beach?.[0] || fallbackImage,
                "maya bay": activityImageData.water.beach?.[0] || fallbackImage,
                "patong": activityImageData.water.beach?.[0] || fallbackImage,
                "floating market": activityImageData.cultural.market?.[0] || fallbackImage,
                "khao san": activityImageData.cultural.street?.[0] || fallbackImage,
                "muay thai": activityImageData.sports["martial arts"]?.[0] || fallbackImage,
                "elephant sanctuary": activityImageData.adventure.animal?.[0] || fallbackImage,
                "longtail boat": activityImageData.water.boat?.[0] || fallbackImage,
                "tuk tuk": activityImageData.cultural.street?.[0] || fallbackImage,
                "thai massage": activityImageData.lifestyle.massage?.[0] || fallbackImage
            },
            
            // Japan related
            "japan": {
                "fushimi inari": activityImageData.cultural.temple?.[0] || fallbackImage,
                "arashiyama": activityImageData.nature.forest?.[0] || fallbackImage,
                "bamboo forest": activityImageData.nature.forest?.[0] || fallbackImage,
                "teamlab": activityImageData.cultural.art?.[0] || fallbackImage,
                "shibuya crossing": activityImageData.cultural.city?.[0] || fallbackImage,
                "sensoji": activityImageData.cultural.temple?.[0] || fallbackImage,
                "mount fuji": activityImageData.adventure.mountain?.[0] || fallbackImage,
                "shinjuku": activityImageData.cultural.city?.[0] || fallbackImage,
                "akihabara": activityImageData.cultural.city?.[0] || fallbackImage,
                "harajuku": activityImageData.cultural.shopping?.[0] || fallbackImage,
                "meiji shrine": activityImageData.cultural.temple?.[0] || fallbackImage,
                "onsen": activityImageData.lifestyle.onsen?.[0] || fallbackImage,
                "tea ceremony": activityImageData.educational["tea ceremony"]?.[0] || fallbackImage,
                "sumo": activityImageData.cultural.traditional?.[0] || fallbackImage,
                "ryokan": activityImageData.lifestyle.relaxation?.[0] || fallbackImage
            },
            
            // Mexico related
            "mexico": {
                "chichen itza": activityImageData.cultural.ruins?.[0] || fallbackImage,
                "tulum": activityImageData.cultural.ruins?.[0] || fallbackImage,
                "cenote": activityImageData.water.swimming?.[0] || fallbackImage,
                "lucha libre": activityImageData.cultural.performance?.[0] || fallbackImage,
                "mariachi": activityImageData.cultural.performance?.[0] || fallbackImage,
                "frida kahlo": activityImageData.cultural.museum?.[0] || fallbackImage,
                "zocalo": activityImageData.cultural.city?.[0] || fallbackImage,
                "dia de los muertos": activityImageData.cultural.festival?.[0] || fallbackImage,
                "puerto escondido": activityImageData.water.surfing?.[0] || fallbackImage,
                "zicatela": activityImageData.water.surfing?.[0] || fallbackImage,
                "mezcal tasting": activityImageData.lifestyle.tasting?.[0] || fallbackImage,
                "coyoacan": activityImageData.cultural.market?.[0] || fallbackImage,
                "teotihuacan": activityImageData.cultural.ruins?.[0] || fallbackImage
            },
            
            // Italy related
            "italy": {
                "colosseum": activityImageData.cultural.ruins?.[0] || fallbackImage,
                "roman forum": activityImageData.cultural.ruins?.[0] || fallbackImage,
                "vatican": activityImageData.cultural.museum?.[0] || fallbackImage,
                "sistine chapel": activityImageData.cultural.church?.[0] || fallbackImage,
                "st peter": activityImageData.cultural.church?.[0] || fallbackImage,
                "trevi fountain": activityImageData.cultural.monument?.[0] || fallbackImage,
                "spanish steps": activityImageData.cultural.monument?.[0] || fallbackImage,
                "gondola": activityImageData.water.boat?.[0] || fallbackImage,
                "grand canal": activityImageData.water.boat?.[0] || fallbackImage,
                "rialto": activityImageData.cultural.historic?.[0] || fallbackImage,
                "duomo": activityImageData.cultural.church?.[0] || fallbackImage,
                "uffizi": activityImageData.cultural.museum?.[0] || fallbackImage,
                "ponte vecchio": activityImageData.cultural.historic?.[0] || fallbackImage,
                "cinque terre": activityImageData.water.coast?.[0] || fallbackImage,
                "pasta making": activityImageData.educational["cooking workshop"]?.[0] || fallbackImage,
                "wine tour": activityImageData.lifestyle.winery?.[0] || fallbackImage
            },
            
            // Add more destinations as needed
        };
        
        // For each destination keyword, check if it's in the trip destination
        // and if so, add its specific activities to the direct match map
        Object.entries(destinationMappings).forEach(([destinationKey, activities]) => {
            if (lowercaseDestination.includes(destinationKey)) {
                Object.assign(directMatchMap, activities);
            }
        });
        
        return directMatchMap;
    };
    
    /**
     * Enhanced getImageForActivity function that adapts to the trip destination
     * This function searches for the most appropriate image for an activity
     * based on the activity text and destination context
     * 
     * @param {Object} activity - The activity object containing activity name, description, etc.
     * @param {string} destination - The trip destination to provide context (e.g., "Thailand", "Japan")
     * @returns {string} - URL of the selected image or fallback image
     */
    const getImageForActivity = (activity, destination = '') => {
        if (!activity) {
        //   console.log('Warning: Activity is undefined');
          return fallbackImage;
        }
        
        try {
          // Extract activity text for matching
          const activityText = `${activity.activity || ''}`.toLowerCase();
          const lowercaseDestination = destination.toLowerCase();  // THIS LINE IS MISSING

          
          // First, try direct matches from your existing data structure
          for (const category in activityImageData) {
            for (const [keyword, imageUrls] of Object.entries(activityImageData[category])) {
                // Use word boundary check with regex
                const keywordRegex = new RegExp(`\\b${keyword.toLowerCase()}\\b`);
                if (keywordRegex.test(activityText) && imageUrls && imageUrls.length > 0) {
                //   console.log(`Direct match found for "${keyword}"`);
                
                // Important fix: Check if the URL is valid before returning it
                const imageUrl = imageUrls[0];
                if (imageUrl && imageUrl.startsWith('http')) {
                  return imageUrl; // Return the first valid URL in the array
                }
              }
            }
          }
            
            // STEP 3: If no direct match, search by destination-aware keywords
            // Define category mapping for keywords
            const categoryMapping = {
                // Water activities keywords
                "sea": { category: "water", subcategory: "sea" },
                "ocean": { category: "water", subcategory: "ocean" },
                "beach": { category: "water", subcategory: "beach" },
                "beachfront": { category: "water", subcategory: "beachfront" },
                "shore": { category: "water", subcategory: "shore" },
                "coast": { category: "water", subcategory: "coast" },
                "surf": { category: "water", subcategory: "surfing" },
                "surfing": { category: "water", subcategory: "surfing" },
                "wave": { category: "water", subcategory: "surfing" },
                "swim": { category: "water", subcategory: "swimming" },
                "swimming": { category: "water", subcategory: "swimming" },
                "snorkel": { category: "water", subcategory: "snorkel" },
                "snorkeling": { category: "water", subcategory: "snorkeling" },
                "dive": { category: "water", subcategory: "diving" },
                "diving": { category: "water", subcategory: "diving" },
                "scuba": { category: "water", subcategory: "scuba" },
                "boat": { category: "water", subcategory: "boat" },
                "boating": { category: "water", subcategory: "boating" },
                "yacht": { category: "water", subcategory: "yacht" },
                "sail": { category: "water", subcategory: "sailing" },
                "sailing": { category: "water", subcategory: "sailing" },
                "cruise": { category: "water", subcategory: "cruise" },
                "cruising": { category: "water", subcategory: "cruising" },
                "island": { category: "water", subcategory: "island" },
                "bay": { category: "water", subcategory: "coast" },
                "lagoon": { category: "water", subcategory: "beach" },
                "reef": { category: "nature", subcategory: "reef" },
                "coral": { category: "nature", subcategory: "coral" },
                "kayak": { category: "water", subcategory: "kayak" },
                "kayaking": { category: "water", subcategory: "kayaking" },
                "paddle": { category: "water", subcategory: "paddleboard" },
                "paddleboard": { category: "water", subcategory: "paddleboard" },
                "paddling": { category: "water", subcategory: "paddling" },
                "canoe": { category: "water", subcategory: "canoe" },
                "canoeing": { category: "water", subcategory: "canoeing" },
                "raft": { category: "water", subcategory: "rafting" },
                "rafting": { category: "water", subcategory: "rafting" },
                "jet ski": { category: "water", subcategory: "jet skiing" },
                "jet skiing": { category: "water", subcategory: "jet skiing" },
                "waterfall": { category: "water", subcategory: "waterfall" },
                "cenote": { category: "water", subcategory: "swimming" },
                "maritime": { category: "water", subcategory: "maritime" },
                "harbour": { category: "water", subcategory: "harbour" },
                "harbor": { category: "water", subcategory: "harbor" },
                "marina": { category: "water", subcategory: "marina" },
                "bodyboarding": { category: "water", subcategory: "bodyboarding" },
                "white water": { category: "water", subcategory: "white water" },
                "catamaran": { category: "water", subcategory: "catamaran" },
                "fishing": { category: "water", subcategory: "fishing" },
                "wakeboarding": { category: "water", subcategory: "wakeboarding" },
                "windsurfing": { category: "water", subcategory: "windsurfing" },
                "flyboarding": { category: "water", subcategory: "flyboarding" },
                "freediving": { category: "water", subcategory: "freediving" },
                "kite surfing": { category: "water", subcategory: "kite surfing" },
                "pearl diving": { category: "water", subcategory: "pearl diving" },
                "picnic": { category: "water", subcategory: "picnic" },
                
                // Adventure activities keywords
                "hike": { category: "adventure", subcategory: "hike" },
                "hiking": { category: "adventure", subcategory: "hiking" },
                "air balloon": { category: "adventure", subcategory: "air balloon" },
                "trek": { category: "adventure", subcategory: "trek" },
                "trekking": { category: "adventure", subcategory: "trekking" },
                "climb": { category: "adventure", subcategory: "climbing" },
                "climbing": { category: "adventure", subcategory: "climbing" },
                "rock climbing": { category: "adventure", subcategory: "rock climbing" },
                "ice climbing": { category: "adventure", subcategory: "ice climbing" },
                "mountain": { category: "adventure", subcategory: "mountain" },
                "mountaineering": { category: "adventure", subcategory: "mountaineering" },
                "valley": { category: "nature", subcategory: "valley" },
                "volcano": { category: "adventure", subcategory: "volcano" },
                "summit": { category: "adventure", subcategory: "summit" },
                "trail": { category: "adventure", subcategory: "trail" },
                "zipline": { category: "adventure", subcategory: "zipline" },
                "ziplining": { category: "adventure", subcategory: "ziplining" },
                "bungee": { category: "adventure", subcategory: "bungee" },
                "bungy": { category: "adventure", subcategory: "bungee" },
                "paraglid": { category: "adventure", subcategory: "paragliding" },
                "paragliding": { category: "adventure", subcategory: "paragliding" },
                "skydiv": { category: "adventure", subcategory: "skydiving" },
                "skydiving": { category: "adventure", subcategory: "skydiving" },
                "wingsuit": { category: "adventure", subcategory: "wingsuit" },
                "hang gliding": { category: "adventure", subcategory: "hang gliding" },
                "horse": { category: "adventure", subcategory: "horseback" },
                "horseback": { category: "adventure", subcategory: "horseback" },
                "riding": { category: "adventure", subcategory: "riding" },
                "horseback riding": { category: "adventure", subcategory: "horseback riding" },
                "safari": { category: "adventure", subcategory: "safari" },
                "wildlife": { category: "adventure", subcategory: "wildlife" },
                "animal": { category: "adventure", subcategory: "animal" },
                "bird": { category: "adventure", subcategory: "birdwatching" },
                "birdwatching": { category: "adventure", subcategory: "birdwatching" },
                "dolphin": { category: "adventure", subcategory: "dolphin" },
                "whale": { category: "adventure", subcategory: "whale" },
                "canyon": { category: "adventure", subcategory: "canyoning" },
                "canyoning": { category: "adventure", subcategory: "canyoning" },
                "sand": { category: "adventure", subcategory: "sandboarding" },
                "sandboarding": { category: "adventure", subcategory: "sandboarding" },
                "dune": { category: "nature", subcategory: "dune" },
                "cave": { category: "adventure", subcategory: "caving" },
                "caving": { category: "adventure", subcategory: "caving" },
                "spelunking": { category: "adventure", subcategory: "spelunking" },
                "helicopter": { category: "adventure", subcategory: "helicopter" },
                "via ferrata": { category: "adventure", subcategory: "via ferrata" },
                "rappelling": { category: "adventure", subcategory: "rappelling" },
                "zorbing": { category: "adventure", subcategory: "zorbing" },
                
                // Cultural & urban keywords
                "museum": { category: "cultural", subcategory: "museum" },
                "gallery": { category: "cultural", subcategory: "gallery" },
                "art": { category: "cultural", subcategory: "art" },
                "exhibit": { category: "cultural", subcategory: "exhibition" },
                "exhibition": { category: "cultural", subcategory: "exhibition" },
                "temple": { category: "cultural", subcategory: "temple" },
                "shrine": { category: "cultural", subcategory: "temple" },
                "church": { category: "cultural", subcategory: "church" },
                "mosque": { category: "cultural", subcategory: "mosque" },
                "cathedral": { category: "cultural", subcategory: "cathedral" },
                "palace": { category: "cultural", subcategory: "palace" },
                "castle": { category: "cultural", subcategory: "castle" },
                "ruins": { category: "cultural", subcategory: "ruins" },
                "ancient": { category: "cultural", subcategory: "ruins" },
                "historic": { category: "cultural", subcategory: "historic" },
                "heritage": { category: "cultural", subcategory: "historic" },
                "monument": { category: "cultural", subcategory: "monument" },
                "memorial": { category: "cultural", subcategory: "memorial" },
                "archaeology": { category: "cultural", subcategory: "archaeology" },
                "city": { category: "cultural", subcategory: "city" },
                "town": { category: "cultural", subcategory: "city" },
                "village": { category: "cultural", subcategory: "city" },
                "urban": { category: "cultural", subcategory: "urban" },
                "skyline": { category: "cultural", subcategory: "skyline" },
                "architecture": { category: "cultural", subcategory: "architecture" },
                "shopping": { category: "cultural", subcategory: "shopping" },
                "market": { category: "cultural", subcategory: "market" },
                "bazaar": { category: "cultural", subcategory: "bazaar" },
                "street": { category: "cultural", subcategory: "street" },
                "tour": { category: "cultural", subcategory: "tour" },
                "guide": { category: "cultural", subcategory: "guide" },
                "performance": { category: "cultural", subcategory: "performance" },
                "show": { category: "cultural", subcategory: "performance" },
                "concert": { category: "cultural", subcategory: "concert" },
                "theater": { category: "cultural", subcategory: "theater" },
                "cinema": { category: "cultural", subcategory: "cinema" },
                "movie": { category: "cultural", subcategory: "movie" },
                "opera": { category: "cultural", subcategory: "opera" },
                "ballet": { category: "cultural", subcategory: "ballet" },
                "dance": { category: "cultural", subcategory: "dance" },
                "festival": { category: "cultural", subcategory: "festival" },
                "ceremony": { category: "cultural", subcategory: "ceremony" },
                "traditional": { category: "cultural", subcategory: "traditional" },
                "crafts": { category: "cultural", subcategory: "traditional" },
                "downtown": { category: "cultural", subcategory: "downtown" },
                "walking": { category: "cultural", subcategory: "walking" },
                "walking tour": { category: "cultural", subcategory: "walking tour" },
                "celebration": { category: "cultural", subcategory: "celebration" },
                "cultural": { category: "cultural", subcategory: "cultural" },
                "amphitheater": { category: "cultural", subcategory: "amphitheater" },
                "poetry reading": { category: "cultural", subcategory: "poetry reading" },
                "calligraphy": { category: "cultural", subcategory: "calligraphy" },
                "pottery making": { category: "cultural", subcategory: "pottery making" },
                "weaving": { category: "cultural", subcategory: "weaving" },
                "glass blowing": { category: "cultural", subcategory: "glass blowing" },
                "street food": { category: "cultural", subcategory: "street food" },
                "night market": { category: "cultural", subcategory: "night market" },
                "parade": { category: "cultural", subcategory: "parade" },
                "lantern festival": { category: "cultural", subcategory: "lantern festival" },
                "traditional dance": { category: "cultural", subcategory: "traditional dance" },
                
                // Food & dining keywords
                "restaurant": { category: "lifestyle", subcategory: "restaurant" },
                "dining": { category: "lifestyle", subcategory: "dining" },
                "dinner": { category: "lifestyle", subcategory: "dinner" },
                "lunch": { category: "lifestyle", subcategory: "lunch" },
                "Lunch at": { category: "lifestyle", subcategory: "Lunch at" },
                "breakfast": { category: "lifestyle", subcategory: "breakfast" },
                "brunch": { category: "lifestyle", subcategory: "breakfast" },
                "food": { category: "lifestyle", subcategory: "food" },
                "cuisine": { category: "lifestyle", subcategory: "food" },
                "culinary": { category: "lifestyle", subcategory: "culinary" },
                "tasting": { category: "lifestyle", subcategory: "tasting" },
                "cooking": { category: "lifestyle", subcategory: "cooking" },
                "chef": { category: "lifestyle", subcategory: "cooking" },
                "wine": { category: "lifestyle", subcategory: "wine" },
                "winery": { category: "lifestyle", subcategory: "winery" },
                "vineyard": { category: "lifestyle", subcategory: "vineyard" },
                "brewery": { category: "lifestyle", subcategory: "brewery" },
                "beer": { category: "lifestyle", subcategory: "beer" },
                "bar": { category: "lifestyle", subcategory: "bar" },
                "cafe": { category: "lifestyle", subcategory: "cafe" },
                "coffee": { category: "lifestyle", subcategory: "coffee" },
                "departure": { category: "lifestyle", subcategory: "departure" },
                "arrival": { category: "lifestyle", subcategory: "arrival" },
                "landing": { category: "lifestyle", subcategory: "landing" },
                "check in": { category: "lifestyle", subcategory: "check in" },
                "check out": { category: "lifestyle", subcategory: "check out" },
                "meal": { category: "lifestyle", subcategory: "meal" },
                "cooking class": { category: "lifestyle", subcategory: "cooking class" },
                
                // Nature & landscape keywords
                "forest": { category: "nature", subcategory: "forest" },
                "woods": { category: "nature", subcategory: "woods" },
                "jungle": { category: "nature", subcategory: "forest" },
                "park": { category: "nature", subcategory: "park" },
                "garden": { category: "nature", subcategory: "garden" },
                "botanical": { category: "nature", subcategory: "botanical" },
                "meadow": { category: "nature", subcategory: "meadow" },
                "field": { category: "nature", subcategory: "field" },
                "river": { category: "nature", subcategory: "river" },
                "lake": { category: "nature", subcategory: "lake" },
                "stream": { category: "nature", subcategory: "river" },
                "desert": { category: "nature", subcategory: "desert" },
                "canyon": { category: "nature", subcategory: "canyon" },
                "cave": { category: "nature", subcategory: "cave" },
                "countryside": { category: "nature", subcategory: "countryside" },
                "landscape": { category: "nature", subcategory: "landscape" },
                "scenic": { category: "nature", subcategory: "landscape" },
                "astronomy": { category: "nature", subcategory: "astronomy" },
                "stars": { category: "nature", subcategory: "stargazing" },
                "stargazing": { category: "nature", subcategory: "stargazing" },
                "aurora": { category: "nature", subcategory: "aurora" },
                "northern light": { category: "nature", subcategory: "northern lights" },
                "northern lights": { category: "nature", subcategory: "northern lights" },
                "sunrise": { category: "nature", subcategory: "sunrise" },
                "sunset": { category: "nature", subcategory: "sunset" },
                "rainbow": { category: "nature", subcategory: "rainbow" },
                "fjord": { category: "nature", subcategory: "fjord" },
                "geyser": { category: "nature", subcategory: "geyser" },
                "salt flat": { category: "nature", subcategory: "salt flat" },
                "salt pan": { category: "nature", subcategory: "salt flat" },
                "mangrove": { category: "nature", subcategory: "mangrove" },
                "glacier": { category: "nature", subcategory: "glacier" },
                "ice": { category: "nature", subcategory: "glacier" },
                "savanna": { category: "nature", subcategory: "savanna" },
                "tundra": { category: "nature", subcategory: "tundra" },
                "wetland": { category: "nature", subcategory: "wetland" },
                
                // Wellness & relaxation keywords
                "spa": { category: "lifestyle", subcategory: "spa" },
                "massage": { category: "lifestyle", subcategory: "massage" },
                "wellness": { category: "lifestyle", subcategory: "wellness" },
                "relaxation": { category: "lifestyle", subcategory: "relaxation" },
                "resort": { category: "lifestyle", subcategory: "relaxation" },
                "hot spring": { category: "lifestyle", subcategory: "hot spring" },
                "thermal": { category: "lifestyle", subcategory: "thermal" },
                "bath": { category: "lifestyle", subcategory: "bath" },
                "onsen": { category: "lifestyle", subcategory: "onsen" },
                "yoga": { category: "lifestyle", subcategory: "yoga" },
                "meditation": { category: "lifestyle", subcategory: "meditation" },
                "mindfulness": { category: "lifestyle", subcategory: "mindfulness" },
                "retreat": { category: "lifestyle", subcategory: "retreat" },
                "acupuncture": { category: "wellness", subcategory: "acupuncture" },
                "sound healing": { category: "wellness", subcategory: "sound healing" },
                "forest bathing": { category: "wellness", subcategory: "forest bathing" },
                "tai chi": { category: "wellness", subcategory: "tai chi" },
                "aromatherapy": { category: "wellness", subcategory: "aromatherapy" },
                "crystal healing": { category: "wellness", subcategory: "crystal healing" },
                "reiki": { category: "wellness", subcategory: "reiki" },
                "flotation tank": { category: "wellness", subcategory: "flotation tank" },
                "mud bath": { category: "wellness", subcategory: "mud bath" },
                
                // Sports & recreation keywords
                "golf": { category: "sports", subcategory: "golf" },
                "tennis": { category: "sports", subcategory: "tennis" },
                "ski": { category: "sports", subcategory: "skiing" },
                "skiing": { category: "sports", subcategory: "skiing" },
                "snowboard": { category: "sports", subcategory: "snowboarding" },
                "snowboarding": { category: "sports", subcategory: "snowboarding" },
                "bike": { category: "sports", subcategory: "biking" },
                "biking": { category: "sports", subcategory: "biking" },
                "cycling": { category: "sports", subcategory: "cycling" },
                "run": { category: "sports", subcategory: "running" },
                "running": { category: "sports", subcategory: "running" },
                "basketball": { category: "sports", subcategory: "basketball" },
                "football": { category: "sports", subcategory: "football" },
                "soccer": { category: "sports", subcategory: "soccer" },
                "volleyball": { category: "sports", subcategory: "volleyball" },
                "baseball": { category: "sports", subcategory: "baseball" },
                "hockey": { category: "sports", subcategory: "hockey" },
                "archery": { category: "sports", subcategory: "archery" },
                "axe": { category: "sports", subcategory: "axe throwing" },
                "axe throwing": { category: "sports", subcategory: "axe throwing" },
                "parkour": { category: "sports", subcategory: "parkour" },
                "bouldering": { category: "sports", subcategory: "bouldering" },
                "fencing": { category: "sports", subcategory: "fencing" },
                "martial art": { category: "sports", subcategory: "martial arts" },
                "martial arts": { category: "sports", subcategory: "martial arts" },
                "trampoline": { category: "sports", subcategory: "trampoline" },
                "skate": { category: "sports", subcategory: "skateboarding" },
                "skateboarding": { category: "sports", subcategory: "skateboarding" },
                "roller": { category: "sports", subcategory: "roller skating" },
                "roller skating": { category: "sports", subcategory: "roller skating" },
                "rock wall": { category: "sports", subcategory: "rock wall" },
                
                // Educational & workshop keywords
                "class": { category: "educational", subcategory: "class" },
                "workshop": { category: "educational", subcategory: "craft workshop" },
                "craft workshop": { category: "educational", subcategory: "craft workshop" },
                "lesson": { category: "educational", subcategory: "class" },
                "teach": { category: "educational", subcategory: "class" },
                "learn": { category: "educational", subcategory: "class" },
                "astronomy class": { category: "educational", subcategory: "astronomy class" },
                "cooking workshop": { category: "educational", subcategory: "cooking workshop" },
                "wine tasting": { category: "educational", subcategory: "wine tasting" },
                "tea ceremony": { category: "educational", subcategory: "tea ceremony" },
                "perfume making": { category: "educational", subcategory: "perfume making" },
                "chocolate making": { category: "educational", subcategory: "chocolate making" },
                "bread baking": { category: "educational", subcategory: "bread baking" },
                "cheese making": { category: "educational", subcategory: "cheese making" },
                "language": { category: "educational", subcategory: "language class" },
                "language class": { category: "educational", subcategory: "language class" },
                
                // Rural & agricultural keywords
                "farm": { category: "rural", subcategory: "farm stay" },
                "farm stay": { category: "rural", subcategory: "farm stay" },
                "olive": { category: "rural", subcategory: "olive harvesting" },
                "olive harvesting": { category: "rural", subcategory: "olive harvesting" },
                "grape": { category: "rural", subcategory: "grape picking" },
                "grape picking": { category: "rural", subcategory: "grape picking" },
                "harvest": { category: "rural", subcategory: "organic farming" },
                "bee": { category: "rural", subcategory: "beekeeping" },
                "beekeeping": { category: "rural", subcategory: "beekeeping" },
                "truffle": { category: "rural", subcategory: "truffle hunting" },
                "truffle hunting": { category: "rural", subcategory: "truffle hunting" },
                "rice": { category: "rural", subcategory: "rice farming" },
                "rice farming": { category: "rural", subcategory: "rice farming" },
                "organic": { category: "rural", subcategory: "organic farming" },
                "organic farming": { category: "rural", subcategory: "organic farming" },
                "sheep": { category: "rural", subcategory: "sheep herding" },
                "sheep herding": { category: "rural", subcategory: "sheep herding" },
                "maple": { category: "rural", subcategory: "maple tapping" },
                "maple tapping": { category: "rural", subcategory: "maple tapping" },
                "lavender": { category: "rural", subcategory: "lavender field" },
                "lavender field": { category: "rural", subcategory: "lavender field" }
};
            
            // Build an array of keyword matches for the activity text
            const matchedKeywords = [];
            
            // Check each keyword for a match
            for (const [keyword, mapping] of Object.entries(categoryMapping)) {
                const keywordRegex = new RegExp(`\\b${keyword.toLowerCase()}\\b`);
                if (keywordRegex.test(activityText)) {
                  matchedKeywords.push({
                        keyword,
                        category: mapping.category,
                        subcategory: mapping.subcategory,
                        length: keyword.length // Track length for sorting
                    });
                }
            }
            
            // Sort matches by keyword length (longer = more specific)
            matchedKeywords.sort((a, b) => b.length - a.length);
            
            // If we have matches, use the best (longest) match
            if (matchedKeywords.length > 0) {
                const bestMatch = matchedKeywords[0];
                // console.log(`Best keyword match: "${bestMatch.keyword}" -> ${bestMatch.category}.${bestMatch.subcategory}`);
                
                // Safely access image data with fallbacks
                const categoryData = activityImageData[bestMatch.category] || {};
                const subcategoryData = categoryData[bestMatch.subcategory] || [];
                
                if (subcategoryData.length > 0 && subcategoryData[0]) {
                    return subcategoryData[0];
                }
            }
            
            // STEP 4: If still no match, try specific location matches based on destination
            const destinationSpecificLocations = {
                // Thailand locations
                "thailand": {
                    "bangkok": activityImageData.cultural.city?.[0] || fallbackImage,
                    "phuket": activityImageData.water.beach?.[0] || fallbackImage,
                    "chiang mai": activityImageData.cultural.temple?.[0] || fallbackImage,
                    "koh samui": activityImageData.water.beach?.[0] || fallbackImage,
                    "koh phi phi": activityImageData.water.beach?.[0] || fallbackImage,
                    "pattaya": activityImageData.water.beach?.[0] || fallbackImage,
                    "hua hin": activityImageData.water.beach?.[0] || fallbackImage,
                    "koh tao": activityImageData.water.diving?.[0] || fallbackImage,
                    "krabi": activityImageData.water.beach?.[0] || fallbackImage,
                    "ao nang": activityImageData.water.beach?.[0] || fallbackImage,
                    "railay": activityImageData.adventure.climbing?.[0] || fallbackImage,
                    "ayutthaya": activityImageData.cultural.ruins?.[0] || fallbackImage,
                    "sukhothai": activityImageData.cultural.ruins?.[0] || fallbackImage,
                    "khao yai": activityImageData.nature.park?.[0] || fallbackImage
                },
                
                // Japan locations
                "japan": {
                    "tokyo": activityImageData.cultural.city?.[0] || fallbackImage,
                    "kyoto": activityImageData.cultural.temple?.[0] || fallbackImage,
                    "osaka": activityImageData.cultural.city?.[0] || fallbackImage,
                    "nara": activityImageData.adventure.animal?.[0] || fallbackImage,
                    "hokkaido": activityImageData.sports.skiing?.[0] || fallbackImage,
                    "okinawa": activityImageData.water.beach?.[0] || fallbackImage,
                    "hakone": activityImageData.nature.mountain?.[0] || fallbackImage,
                    "fuji": activityImageData.adventure.mountain?.[0] || fallbackImage,
                    "hiroshima": activityImageData.cultural.memorial?.[0] || fallbackImage,
                    "miyajima": activityImageData.cultural.temple?.[0] || fallbackImage,
                    "shibuya": activityImageData.cultural.city?.[0] || fallbackImage,
                    "shinjuku": activityImageData.cultural.city?.[0] || fallbackImage,
                    "harajuku": activityImageData.cultural.shopping?.[0] || fallbackImage,
                    "akihabara": activityImageData.cultural.city?.[0] || fallbackImage
                },
                
                // Mexico locations
                "mexico": {
                    "cancun": activityImageData.water.beach?.[0] || fallbackImage,
                    "tulum": activityImageData.cultural.ruins?.[0] || fallbackImage,
                    "playa del carmen": activityImageData.water.beach?.[0] || fallbackImage,
                    "isla mujeres": activityImageData.water.beach?.[0] || fallbackImage,
                    "mexico city": activityImageData.cultural.city?.[0] || fallbackImage,
                    "oaxaca": activityImageData.cultural.traditional?.[0] || fallbackImage,
                    "guanajuato": activityImageData.cultural.city?.[0] || fallbackImage,
                    "san miguel": activityImageData.cultural.city?.[0] || fallbackImage,
                    "guadalajara": activityImageData.cultural.city?.[0] || fallbackImage,
                    "puerto vallarta": activityImageData.water.beach?.[0] || fallbackImage,
                    "cabo": activityImageData.water.beach?.[0] || fallbackImage,
                    "baja": activityImageData.water.beach?.[0] || fallbackImage,
                    "puerto escondido": activityImageData.water.surfing?.[0] || fallbackImage,
                    "huatulco": activityImageData.water.beach?.[0] || fallbackImage,
                    "sayulita": activityImageData.water.beach?.[0] || fallbackImage
                },
                
                // Italy locations
                "italy": {
                    "rome": activityImageData.cultural.ruins?.[0] || fallbackImage,
                    "vatican": activityImageData.cultural.church?.[0] || fallbackImage,
                    "florence": activityImageData.cultural.art?.[0] || fallbackImage,
                    "venice": activityImageData.water.boat?.[0] || fallbackImage,
                    "milan": activityImageData.cultural.city?.[0] || fallbackImage,
                    "amalfi": activityImageData.water.coast?.[0] || fallbackImage,
                    "positano": activityImageData.water.coast?.[0] || fallbackImage,
                    "cinque terre": activityImageData.water.coast?.[0] || fallbackImage,
                    "tuscany": activityImageData.lifestyle.winery?.[0] || fallbackImage,
                    "siena": activityImageData.cultural.historic?.[0] || fallbackImage,
                    "pisa": activityImageData.cultural.monument?.[0] || fallbackImage,
                    "naples": activityImageData.lifestyle.food?.[0] || fallbackImage,
                    "pompeii": activityImageData.cultural.ruins?.[0] || fallbackImage,
                    "sicily": activityImageData.cultural.ruins?.[0] || fallbackImage,
                    "sardinia": activityImageData.water.beach?.[0] || fallbackImage
                },
                
                // Nepal locations
                "nepal": {
                    "kathmandu": activityImageData.cultural.temple?.[0] || fallbackImage,
                    "pokhara": activityImageData.adventure.paragliding?.[0] || fallbackImage,
                    "chitwan": activityImageData.adventure.safari?.[0] || fallbackImage,
                    "everest": activityImageData.adventure.trekking?.[0] || fallbackImage,
                    "annapurna": activityImageData.adventure.trekking?.[0] || fallbackImage,
                    "lumbini": activityImageData.cultural.temple?.[0] || fallbackImage,
                    "nagarkot": activityImageData.nature.sunrise?.[0] || fallbackImage,
                    "bhaktapur": activityImageData.cultural.historic?.[0] || fallbackImage,
                    "patan": activityImageData.cultural.temple?.[0] || fallbackImage,
                    "pashupatinath": activityImageData.cultural.temple?.[0] || fallbackImage,
                    "thamel": activityImageData.cultural.market?.[0] || fallbackImage,
                    "langtang": activityImageData.adventure.trekking?.[0] || fallbackImage,
                    "gokyo": activityImageData.adventure.trekking?.[0] || fallbackImage,
                    "lukla": activityImageData.adventure.trekking?.[0] || fallbackImage
                }
                
                // Add more destinations and their specific locations as needed
            };
            
            // Check location matches for the current destination
            for (const [destKey, locations] of Object.entries(destinationSpecificLocations)) {
                if (lowercaseDestination.includes(destKey)) {
                    for (const [location, imageUrl] of Object.entries(locations)) {
                        if (activityText.includes(location)) {
                            // console.log(`Location match found for destination ${destKey}: "${location}"`);
                            return imageUrl;
                        }
                    }
                }
            }
            
            // STEP 5: Time-based fallback if nothing else matched
            // console.log("Using time-based fallback image selection");
            let hour = 12; // Default to noon if no time specified
            
            if (activity.bestTime) {
                const timeParts = activity.bestTime.split(':');
                if (timeParts.length > 0) {
                    hour = parseInt(timeParts[0], 10);
                    if (isNaN(hour)) hour = 12;
                }
            }
            
            if (hour >= 5 && hour < 11) {
                // console.log("Morning activity (5-11 AM)");
                return timeOfDayImages.morning || fallbackImage;
            } else if (hour >= 11 && hour < 17) {
                // console.log("Afternoon activity (11 AM-5 PM)");
                return timeOfDayImages.afternoon || fallbackImage;
            } else {
                // console.log("Evening activity (5 PM onwards or before 5 AM)");
                return timeOfDayImages.evening || fallbackImage;
            }
        } catch (error) {
            console.error("Error in getImageForActivity:", error);
            return fallbackImage; // Return fallback image on any error
        }
    };
    
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
  src={getImageForActivity(activity, destination)}
  alt={activity.activity}
  className="w-full h-full object-cover"
  onError={(e) => {
    e.target.onerror = null; // Prevent infinite error loops
    // console.log('Image failed to load for:', activity.activity);
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