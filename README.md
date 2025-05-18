# TOMATO AGENT APP 

## 프로젝트 소개  
이 프로젝트는 기존에 개발한 tomatoAgent의 서버부분을 개선시킨 프로젝트이다.  
예전 프로젝트에는 langchain을 주로 사용하여 gpt의 agent기능을 사용했는데 확실히 간단하게 함수만으로 구성할 수 있어 편했으나, 너무 많은 기능과 커스터마이징의 한계로 인해서 차라리 openAI 라이브러리만 사용해서 만드는 것이 낫겠다고 판단되어서 새로 개발하게 되었다.  
그리고 기존 프로젝트의 서버는 단순한 형태로 구성되어 있어서, 성능 향상과 확장성을 고려하여 Redis와 MSA구조를 도입하게 되었다.  

## 블로그  
해당 프로젝트의 백엔드와 인프라 구성에 대해 정리한 포스트이다.  
[블로그 이동하기](https://wsportfolio.vercel.app/blog/post_1)  

## 화면 구성  
### 회원가입 및 로그인  
![img1](https://github.com/Oldentomato/tomatoAgentApp/blob/main/readme/Animation4.gif?raw=true)  
### 웹 검색도구를 이용한 채팅  
![img2](https://github.com/Oldentomato/tomatoAgentApp/blob/main/readme/Animation.gif?raw=true)  
### gptArchive 화면 구성  
![img3](https://github.com/Oldentomato/tomatoAgentApp/blob/main/readme/Animation2.gif?raw=true)  
### gptArchive 활용  
![img4](https://github.com/Oldentomato/tomatoAgentApp/blob/main/readme/Animation3.gif?raw=true)  

## 공동 개발자  
[MiTY0311](https://github.com/MiTY0311)
