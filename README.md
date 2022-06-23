# 中国地址库服务

## 目标

- 为业务应用提供高可用的地址服务
- 拓展了 Gavin 服务的能力，为 PC、小程序、APP、H5 应用提供了基于 Restful 风格的 API
- 支持多种结构的数据的查询

## 服务能力

- 省市区街道四级地址库查询服务
  - 省市区数据是国家统计局发布的；我们遵循这个规范并及时更新；
  - 通过 fork 第三方资源（JD\Github）,我们提供了四级地址（街道/乡镇）数据；
  - 在工具组的地址数据基础上，我们新增了多种数据结构（树形、List、Map）的支持；
- 地址分词&解构成标准数据格式
  - 对整段的地址（省市区县街道乡镇详细地址）进行分词，返回标准的数据格式；

## TODO

- 除了 Restful 风格的 API, 服务能够兼容 GraphQL 风格的查询
- 把 Dubbo 的数据迁移到 ES、该服务不再内置 DB
- 拓展拼音、检拼、首字母

## 项目目录

```bash
  |__script // 脚本：bugatti
  |__src
  |    |__controller // 控制层
  |    |__db // 数据索引文件、数据缓存json文件
  |    |  |__**.json // 数据缓存文件
  |    |  |__region.sqlite // SQLite 数据库索引文档
  |    |  |__region.utf8 // jieba 词频字典
  |    |__filter // 拦截器
  |    |__interface // 实体定义
  |    |__provider // 服务提供者：dubbo\service\dto
  |    |__utils // 工具类
  |    |__main.ts // 项目入口
  |    |__module.ts // app.module
  |__CHANGELOG.md // change log
  |__CONTRIBUTION.md // 项目代码提交规范
  |__README.md // 项目说明文档
```

## 开发 & 运维

### 环境要求

```bash
Node: 8.0+
Npm: 6.0+
```

### 本地

- 修改配置

  nodemon 修改 NODE_ENV 参数（dev\test1\test2\test3\test5\test0\testx），并在 ./config 中添加对应环境的配置文件

- 启动服务

```bash
➜  git clone
➜  cd **
➜  npm i
➜  npm run dev
```

### 生产（测试、灰度）

TODO
- 计划放在 docker hub 中

### 编码风格

本项目使用 Tslint + Prettier 对代码对静态校验和编码规范检查


### 部署

TODOs
docker image

## Restful API

- 服务健康检查

```bash
path: /check
method: GET
version: 0.0.1-RELEASE
response: "ok"
```

- 查询所有地址

```bash
path: /api/region
method: GET
time: 260ms
size: 318KB
version: 0.1.0-RELEASE
response:
  [
    {
      "id": "110000",
      "label": "北京",
      "pids": "086",
      "pid": "086",
      "level": "province",
      "children": [
        {
          "id": "110100",
          "label": "北京市",
          "pids": "086,110000",
          "pid": "110000",
          "level": "city",
          "children": [
            {
              "id": "110101",
              "label": "东城区",
              "pids": "086,110000,110100",
              "pid": "110100",
              "level": "area"
            },
            {
              "id": "110102",
              "label": "西城区",
              "pids": "086,110000,110100",
              "pid": "110100",
              "level": "area"
            },
            ....
```

- 查询所有乡镇、街道、副县级区域

```bash
path: /api/street
method: GET
time: 580ms
size: 670KB
version: 0.1.9-RELEASE
response:
  {
    "110101": [
      "全区",
      "东华门街道",
      "东四街道",
      "东直门街道",
      "龙潭街道",
      "东花市街道"
    ],
    "110102": [
      "全区",
      "大栅栏街道",
      "天桥街道",
      ...
```

- 分词（[兼容性](#分词兼容性)）

```bash
path: /api/region/struct
method: POST
time: 45ms
size: 443B
version: 0.1.5-RELEASE
request:
  {
    "q":"江苏省扬州市宝应县山阳镇中心小学"
  }
response:
  {
    "provinceId": "320000",
    "province": "江苏省",
    "cityId": "321000",
    "city": "扬州市",
    "areaId": "321023",
    "area": "宝应县",
    "streetId": "321023111",
    "street": "山阳镇",
    "regionCode": "321023111",
    "regionId": "321023",
    "address": "中心小学",
    "detail": "山阳镇中心小学"
  }
```

- 分词（同上）

```bash
path: /api/region/struct?q=
method: GET
time: 60ms
size: 500B
version: 0.1.5-RELEASE
response: ...
```

- 查询某个区域或县城的街道、乡镇

```bash
pth: /api/street/:areaId
method: GET
time: 67ms
size: 537B
version: 0.1.9-RELEASE
ex: /api/street/321023
response:
  {
    "pid": "321023",
    "value": "全区,夏集镇,广洋湖镇,泾河镇,西安丰镇,开发区管委会,氾水镇,鲁垛镇,曹甸镇,山阳镇,黄塍镇,安宜镇,小官庄镇,望直港镇,柳堡镇,射阳湖镇"
  }
```

- 查询某个区域或县城的街道、乡镇

```bash
pth: /api/streets/:areaId
method: GET
time: 45ms
size: 1.18KB
version: 0.2.0-RELEASE
ex: /api/street/321023
response:
  [
    {
      "name": "夏集镇",
      "id": "321023102",
      "pid": "321023"
    },
    {
      "name": "广洋湖镇",
      "id": "321023105",
      "pid": "321023"
    },
    {
      "name": "泾河镇",
      "id": "321023113",
      "pid": "321023"
    },
    ...
```

- 根据编号查询地区信息

```bash
pth: /api/region/id?q=
method: GET
time: 67ms
size: 537B
version: 0.2.0-RELEASE
ex: /api/region/id?q=321023
response:
  {
    "id": "321023",
    "pid": "321000",
    "pids": "086,320000,321000",
    "name": "宝应县",
    "level": "area"
  }
```

- 根据父级编号查询地区信息（不支持街道信息）

```bash
pth: /api/region/pid?q=
method: GET
time: 30ms
size: 537B
version: 0.2.0-RELEASE
ex: /api/region/pid?q=321000
response:
  [
    {
      "id": "321002",
      "pid": "321000",
      "pids": "086,320000,321000",
      "name": "广陵区",
      "level": "area"
    },
    {
      "id": "321003",
      "pid": "321000",
      "pids": "086,320000,321000",
      "name": "邗江区",
      "level": "area"
    },
  ...
```

- 根据名称查询地区信息

```bash
pth: /api/region/name?q=
method: GET
time: 46ms
size: 408B
version: 0.2.0-RELEASE
ex: /api/region/name?q=广陵区
response:
  [
    {
      "id": "321002",
      "pid": "321000",
      "pids": "086,320000,321000",
      "name": "广陵区",
      "level": "area"
    }
  ]
```

- 根据行政等级查询地区信息

```bash
pth: /api/region/level?q=
method: GET
time: 288ms
size: 270KB
version: 0.2.0-RELEASE
ex: /api/region/level?q=area
response:
  [
    {
      "id": "110101",
      "pid": "110100",
      "pids": "086,110000,110100",
      "name": "东城区",
      "level": "area"
    },
    {
      "id": "110102",
      "pid": "110100",
      "pids": "086,110000,110100",
      "name": "西城区",
      "level": "area"
    },
  ...
```

### 分词兼容能力

|    缺失类型    | 缺失情况     | 是否支持 |              备注               |
| :------------: | :----------- | :------: | :-----------------------------: |
|  行政级别缺失  |              |          |                                 |
|                | 省市区       |    Y     |                                 |
|                | 省市-        |    Y     |                                 |
|                | 省-区        |    N     |                                 |
|                | 省--         |    Y     |                                 |
|                | -市区        |    Y     | 相同市&相同区情况下，不保证正确 |
|                | -市-         |    Y     |      短路原则，不保证正确       |
|                | --区         |    N     |                                 |
|                | ---          |    N     |                                 |
| 行政级别名缺失 |              |          |                                 |
|                | --省--市--区 |    N     |                                 |
|                | --省--市\*\* |    N     |                                 |
|                | --省----区   |    N     |                                 |
|                | --省----     |    N     |                                 |
|                | ----市--区   |    N     |                                 |
|                | ----市--     |    N     |                                 |
|                | ----区       |    N     |                                 |
|                | ------       |    N     |                                 |

### 持久化层

#### 分词字典

```txt
北京 99999 province
北京市 9999 city
东城区 999 area
西城区 999 area
朝阳区 999 area
丰台区 999 area
石景山区 999 area
海淀区 999 area
门头沟区 999 area
房山区 999 area
东直门街道 998 street
...
```

#### 表结构

- region

| 字段  |  类型  | Null | 默认 |          注释           |
| :---: | :----: | :--: | :--: | :---------------------: |
|  id   | NUMBER |  NO  |      |        区域编号         |
| name  |  TEXT  |  NO  |      |        区域名称         |
|  pid  | NUMBER |  NO  |      |        父级编号         |
| level |  TEXT  |  NO  |      |        行政级别         |
| pids  |  TEXT  |  NO  |      | 所有父级编号，以','隔开 |
