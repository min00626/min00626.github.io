---
date: 2018-11-11 12:01:35
title: Log Bridge
description: >-
  Lobby 기능 및 Peer to Peer 통신을 구현하여 외나무다리에서 전투를 벌이는 1대 1 대전 게임을 개발한 프로젝트입니다.
tags:
  - Unity
image: /images/logbridge.png
---

## 프로젝트 개요

외나무다리에서 마주친 상대를 공격해 뒤로 밀어내는 1대 1 대전 게임을 개발한 프로젝트입니다. 공격을 받을 경우 일정 거리 뒤로 물러나게 되며, 상대를 다리에서 완전히 밀어내면 승리합니다.

***

## 프로젝트 핵심 기술

1. **Lobby**: Unity Service에서 제공하는 Lobby 서비스를 활용하여 사용자가 로비를 생성하거나 생성된 로비에 참가할 수 있도록 하였습니다.

2. **Relay**: P2P 통신에서 발생할 수 있는 포트포워딩, 클라이언트 IP 노출 등의 문제를 해결하고 원활한 통신 환경을 구축하기 위해 Relay 서비스를 사용하였습니다.

***

## 프로젝트 결과

![logbridge1](/images/logbridge1.gif){: width="1200" height="900"}

로비를 생성하거나 생성된 로비에 참가할 수 있습니다.

<br/>

![logbridge2](/images/logbridge2.gif){: width="1200" height="900"}

![logbridge3](/images/logbridge3.gif){: width="1200" height="900"}

정면 또는 측면을 공격할 수 있습니다. 공격에 성공하면 상대가 일정 거리 뒤로 물러납니다.

<br/>

![logbridge4](/images/logbridge4.gif){: width="1200" height="900"}

정면 또는 측면을 방어할 수 있습니다. 상대가 공격하는 방향에 맞춰 적절한 타이밍에 방어한다면 공격을 방어하고 상대를 짧은 시간 동안 경직시킬 수 있습니다.

<br/>

![logbridge5](/images/logbridge5.gif){: width="1200" height="900"}

공격은 모션 도중 캔슬할 수 있어 심리전을 유도할 수 있습니다.

<br/>

![logbridge6](/images/logbridge6.gif){: width="1200" height="900"}

상대가 외나무다리의 끝에 몰렸을 때 공격에 성공할 경우 승리합니다.

