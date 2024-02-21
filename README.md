
# ElasticSearch Example

## start  
```bash
docker-compose up
npm run dev
```


## ElasticSearch
`http://localhost:9200`

## Kibana
```bash
http://localhost:5601
# dev tools
http://localhost:5601/app/dev_tools#/console
```
### ElasticSearch CRUD

POST
```json
// ドキュメントだけつくる
PUT [:index_name]
```
POST & PUT
```json
// 自動でIDが生成される
POST [:index_name]/_doc
{
  "field": "value"
}
```
```json
// 自分でIDを決める。_docは上書きされる
PUT [:index_name]/_doc/[:id]
{
  "field": "value"
}
```

```json
// _createを使うと上書きされない
PUT [:index_name]/_create/[:id]
{
  "field": "value"
}
```
GET
```json
GET [:index_name]/_doc/[:id]
```



