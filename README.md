![Fast Api Next](https://github.com/kocyigitkim/fastapi-next/raw/main/assets/images/logo.png "Fast Api Next")

# Fast Api Next
Fast Api provides to create advanced level api infrastructures without any effort. It's manage sessions, plugins, middleware-functions automatically and creates secure connections between client and api gateway. Also, you can create real-time routers via enabling web socket support.


<h5>Would you like to support me?</h5>
<a href="https://www.buymeacoffee.com/kocyigitkim"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=kocyigitkim&button_colour=ff0000&font_colour=ffffff&font_family=Poppins&outline_colour=ffffff&coffee_colour=FFDD00" /></a>

# Start here
> [Fast Api Start](https://github.com/kocyigitkim/fastapi-next-start)

# Guidance
> [Guidance](https://docs.kocyigit.kim/tr/fastapi/readme)

# Release History
> [Release History](https://github.com/kocyigitkim/fastapi-next/blob/main/RELEASE.md)

## Entity System (Beta)

Code-first entity & view layer that lets you define:
* Entities (logical -> table mapping)
* Fields (type, defaults, readonly)
* Views (projections, base filters, ordering, search fields, default page size)

Supports OData-like query params at runtime: `$select,$filter,$orderby,$top,$skip,$search` (mounted onto knex, no DB views created).

Example
```ts
import { EntityManager, EntityFieldType, EntityRetrieveManyAction } from 'fastapi-next';

const em = new EntityManager(name => app.context[name]);
em.register({
	name: 'account',
	table: 'accounts',
	fields: [
		{ name: 'id', type: EntityFieldType.Guid, primary: true },
		{ name: 'name', type: EntityFieldType.String },
		{ name: 'isActive', type: EntityFieldType.Boolean, default: true },
		{ name: 'createdOn', type: EntityFieldType.DateTime, readonly: true }
	],
	defaultFields: ['id','name','isActive'],
	views: [
		{ name: 'active', where: { isActive: true }, orderBy: [{ field: 'name'}], search: ['name'] }
	],
	defaultView: 'active'
});
app.registry.registerObject('entities', em);

// In workflow definition
new EntityRetrieveManyAction('entities', 'account', 'active');
```
Request example
```
/api/accounts?$select=id,name&$filter={"isActive":true}&$orderby=name desc&$top=20&$skip=0&$search=foo
```

## DB Middleware Auto-Load

Otomatik veritabanı middleware yükleme:

Uygulama ayarına ekleyin:
```ts
const app = new NextApplication({
	middleware: {
		db: { enabled: true, pluginName: 'db', dirs: ['src/db-middlewares'] }
	}
});
```
### Relation Upsert (Entity + Relations)

Workflow action: EntityUpsertWithRelationsAction

Örnek:
```ts
new EntityUpsertWithRelationsAction(
	'entities',            // entity manager
	'order',               // primary entity
	'$.body.order',        // main order data
	[
		{ relation: 'items', mode: 'replace', dataPath: '$.body.items' }
	]
)
```
Entity tanımı (özet):
```ts
em.register({
	name:'order', table:'orders', fields:[{name:'id',primary:true,type:EntityFieldType.Guid},{name:'orderNo',type:'string'}],
	relations:[{ name:'items', type:'oneToMany', target:'orderItem', foreignKey:'orderId', cascade:{ insert:true, update:true, delete:true } }]
});
em.register({ name:'orderItem', table:'order_items', fields:[{name:'id',primary:true,type:EntityFieldType.Guid},{name:'orderId',type:'guid'},{name:'productId',type:'guid'},{name:'qty',type:'number'}] });
```
İstek body:
```json
{
	"order": { "id":"...", "orderNo":"O-1001" },
	"items": [ {"productId":"P1","qty":2}, {"productId":"P2","qty":1} ]
}
```
mode:'replace' eski çocuk kayıtları siler ve yenilerini ekler; 'upsert' mevcutları günceller, yoksa ekler; 'insert' sadece ekler.
Klasörde bir middleware dosyası (tenantFilter.ts):
```ts
module.exports = {
	name: 'tenantFilter',
	priority: 10,
	before(ctx){
		if(ctx.operation==='select' && ctx.table!=='public_tables') {
			const tenantId = ctx.nextContext.session?.tenantId;
			if(tenantId && !ctx.nextContext.headers['x-bypass-tenant']) {
				ctx.query.where({ tenantId });
			}
			// Soft delete default
			if(!ctx.nextContext.headers['x-bypass-soft-delete']) {
				ctx.query.andWhere({ isDeleted: false });
			}
		}
	}
};
```
Birden fazla export desteği:
```ts
exports.middlewares = [ { name:'a', before(){} }, { name:'b', before(){} } ];
```