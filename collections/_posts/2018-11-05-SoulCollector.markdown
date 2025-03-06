---
date:   2018-11-05 15:01:35 +0300
title:  Soul Collector
description: 모바일 플랫포머 로그라이크 게임을 개발한 프로젝트입니다.
tags:   [Unity]
image:  '/images/rogue_thumbnail.png'
---

## 프로젝트 개요

적을 처치하고 적의 영혼을 모으며 끝없이 펼쳐진 지하 미궁을 탐험하는 모바일 플랫포머 로그라이크 게임을 개발한 프로젝트입니다. 

무기 전환, 스킬 시스템, 아이템 시스템, 미니맵 등 RPG에서 흔히 사용되는 다양한 기능을 구현하였습니다.

***

## 프로젝트 특징

**1. 랜덤 맵 생성 시스템** : 다음 층으로 이동할 때마다 동적으로 맵을 생성합니다.

<div style="display: flex; justify-content: center; align-items: center;">
    <div style="text-align: center; margin-right: 10px;">
        <img src="/images/map1.png" alt="RL" style="max-width: 100%; height: auto;">
    </div>
    <div style="text-align: center;">
        <img src="/images/map2.png" alt="RL" style="max-width: 100%; height: auto;">
    </div>
</div>

<div style="text-align: center; color: #888888; font-size: 16px; margin-top: 10px; margin-bottom: 30px">
  랜덤 생성된 맵
</div>

**2. 최적화** : Garbage Collection 최소화를 위해 Object Pooling과 UniTask를 적극적으로 활용하였고, Batching, Tweening 등의 다양한 최적화 기법을 사용하여 쾌적한 사용자 경험을 제공하였습니다.

***

## 프로젝트 결과

![RL](/images/rogue2.gif){: width="1200" height="900"}
<div style="text-align: center; color: #888888; font-size: 16px; margin-top: -20px; margin-bottom: 50px">
  씬 전환
</div>

![RL](/images/rogue3.gif){: width="1200" height="900"}
<div style="text-align: center; color: #888888; font-size: 16px; margin-top: -20px; margin-bottom: 50px">
  기본 조작
</div>

![RL](/images/rogue1.gif){: width="1200" height="900"}
<div style="text-align: center; color: #888888; font-size: 16px; margin-top: -20px; margin-bottom: 50px">
  회피 기능
</div>

![RL](/images/rogue4.gif){: width="1200" height="900"}
<div style="text-align: center; color: #888888; font-size: 16px; margin-top: -20px; margin-bottom: 50px">
  무기 전환
</div>

![RL](/images/rogue5.gif){: width="1200" height="900"}
<div style="text-align: center; color: #888888; font-size: 16px; margin-top: -20px; margin-bottom: 50px">
  스킬 기능
</div>

![RL](/images/rogue6.gif){: width="1200" height="900"}
<div style="text-align: center; color: #888888; font-size: 16px; margin-top: -20px; margin-bottom: 50px">
  게임 오버
</div>



