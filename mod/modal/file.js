/**
 * MODULE :: FILE
 * --------------------------
 * MODULE FOR HANDLING FILE OUTPUT
 */
module.exports.write = (page) => {
	console.log(`${page.title}`.underline.green);
	console.log(page.URL);
	console.log(page.lastModifiedDate);
	console.log(page.pageSize);
	page.childLinks.forEach((link) => {
		console.log(`\t${link}`);
	});

	if (page.childPages) {
		page.childPages.forEach((childPage) => {
			returnFx.write(childPage);
		});
	} else {
		return true;
	}
}
