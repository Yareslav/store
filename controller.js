/*
	made for quick syntax
	* @param {string} selector of element
	* @param {boolean} if it is true always returns array of elements
	! @returns {DOMElement} or {DOM collection}
	? @public
*/
function $(elem, returnMass) {
    var val = document.querySelectorAll(elem);
    if (val.length > 1 || returnMass) return val;
    else if (val.length == 1) return val[0];
    else return null;
}
class Controller {
    constructor() {
        view.displayProductList();
        model.createStores();
        this.events();
		}
		/*	sets all of the app events
			? @private
		*/
    events() {
        var process = {
						// responsible for search events
						// ? @private
            searchEvents: () => {
                const clear = $(`.list__clear`),
										rotate = $(`.list__rotate`);
									// when you search for current store
                $(`[type="search"]`).addEventListener(`click`, (eve) => {
										model.searchStore(eve.currentTarget.value)
                });
								clear.style.display = `none`;
								//when you write text in the input which searches for stores
                view.input.addEventListener(`keyup`, () => {
                    if (!view.input.value) return;
                    clear.removeAttribute(`style`);
								});
								//when you focus on this input
                view.input.addEventListener(`focus`, () => {
                    rotate.style.display = `none`;
								});
								// when you leave this input
                view.input.addEventListener(`blur`, () => {
                    if (!view.input.value) {
                        rotate.removeAttribute(`style`);
                        clear.style.display = `none`;
                    }
								});
								//when you press clear button
                clear.addEventListener(`click`, () => {
                    clear.style.display = `none`;
                    rotate.removeAttribute(`style`);
                    view.input.value = ``;
                    view.input.blur();
                    view.fillStoresList();
                    view.selectStorage();
                });
						},
						//responsible for sorting , grouping and searching products events
						// ? @private
            sortEvents: () => {
							//when you start grouping products by their status
                $(`.head__control`).forEach((elem, ind) => {
                    elem.setAttribute(`content`, elem.textContent.trim());
                    if (ind == 0) elem.classList.add(`activeSort`);
                    elem.addEventListener(`click`, () => {
                        view.removeStatus(`Input`);
                        $(`.activeSort`)?.classList.remove(`activeSort`);
												elem.classList.add(`activeSort`);
												view.removeStatus(`Sort`);
                        model.sortByStatus(elem.getAttribute(`content`));
                    });
								});
								// when you start sorting products
                $(`[column]`).forEach((elem) => {
                    const column = elem.getAttribute(`column`);
                    elem.querySelectorAll(`[change]`).forEach((clicker) => {
                        clicker.addEventListener(`click`, () => {
                            if (clicker.classList.contains(`selectedSorter`)) {
                                view.removeStatus(`Sort`);
                            } else {
                                $(`.selectedSorter`)?.classList.remove(
                                    `selectedSorter`
                                );
                                clicker.classList.add(`selectedSorter`);
                                model.sortByOrder(
                                    clicker.getAttribute(`change`),
                                    column
                                );
                            }
                        });
                    });
								});
								//when you select new storage
                $(`.list__blocko`).addEventListener(`click`, () => {
                    view.removeStatus(`all`);
								});
								//when you start searching for products
                $(`.footer__lupa`).addEventListener(`click`, () => {
										view.removeStatus(`Sort`, true);
                    model.searchProducts($(`.footer__input input`).value);
                });
						},
						//responsible for storage and products deleting and adding
						// ? @private
            manageProductsEvents: () => {
							// sets attributes to adding menu columns
                $(`.add__column`).forEach((elem) => {
                    elem.setAttribute(
                        `key`,
                        elem.querySelector(`p`).textContent.split(` `).join(``)
                    );
								});
								//when you press add or delete button in footer
                $(`[status]`).forEach((elem) => {
                    elem.addEventListener(`click`, (eve) => {
                        const element = eve.currentTarget,
                            status = element.getAttribute(`status`);
                        if (element.getAttribute(`type`) == `add`) {
                            view.addingMenu(true, status);
                            model.addStatus = {
                                type: status,
                            };
                        } else {
                            view.deletingMenu(true, status);
                            model.deleteStatus = {
                                type: status,
                            };
                        }
                    });
								});
								//when you press cannel or ok on warning menu about deleting a product or a storage
                $(`.warning__buttons div`).forEach((elem) => {
                    elem.addEventListener(`click`, (eve) => {
                        if (eve.currentTarget.getAttribute(`type`) == `good`)
                            model.delete();
                        model.deleteStatus = {};
                        view.deletingMenu(false);
                    });
								});
								//when you filled adding menu and pressed ok
                $(`.add__swipe div`).forEach((elem) => {
										elem.addEventListener(`click`, (eve) => {
											const target=eve.currentTarget;
											model.readyToAddOrChangeProductsOrStorages(target)
										}
                    );
								});
								// when you decided to delete a product
            }
        };
				Object.keys(process).forEach((func) => process[func]());
		}
		/*
			adds event listeners that shows field data of new products
			? @public
		*/
    setProductTextDisplayers() {
			//sets fields that will show data in current format
        $(`.footer__hide`,true).forEach((item) => {
            item.addEventListener(`mouseenter`,(eve)=> view.displayOrDeleteProductFillData(eve,true));
            item.addEventListener(`mouseleave`,view.displayOrDeleteProductFillData);
				});
				$(`.footer__clear`,true).forEach((elem) => {
					elem.addEventListener(`click`, (eve) => {
						model.setProductDelete(eve,`clear`)
					});
				});
				// when you decided to edit a product
				$(`.footer__edit`,true).forEach((elem) => {
					elem.addEventListener(`click`, (eve) => {
						model.setProductDelete(eve,`edit`)
					});
				});
        //model.setProductDelete();
		}
		/*
			advertising to View class via Model class
			? @public
			* @param {string} name of function that will be called
			* @param {array} all data you want to insert in this function
		*/
		toView(func,...data) {
			view[func](...data)
		}
		/*
			advertising to Model class via View class
			? @public
			* @param {string} name of function that will be called
			* @param {array} all data you want to insert in this function
		*/
		toModel(func,...data) {
			model[func](...data);
		}
}
class View {
		//{DOM element} which is store searching menu
    input = $(`.list__input input`);
    /*
			shows a message at certain period of time
			* @param {string} message you want to show
			? @public
		*/
    info(text) {
        const infoBlock = $(`.info`);
        infoBlock.style.display = `flex`;
        infoBlock.querySelector(`p`).textContent = text;
        setTimeout(() => {
            infoBlock.style.display = `none`;
        }, 3000);
    }
    /*
		* @param {boolean} decides to show or to hide warning
		* status {string} inserted in text shows type of warning
		? @public
	*/
    deletingMenu(show, status) {
        var mass = [$(`.details`), $(`.warning`), $(`.details__fon`)].forEach(
            (elem) => {
                elem.style.display = show ? `flex` : `none`;
            }
        );
        if (show)
            $(
                `.warning p`
            ).textContent = `Are you sure you want to delete this ${status} ?`;
    }
    /*
	shows or hides adding Product or Adding Store menu
		* @param {boolean} shows or hide menu
		* @param {string} type of menu ( product or storage )
			?? @public
	*/
    addingMenu(show, type) {
        if (!show) {
            $(`.add input`).forEach((elem) => {
                elem.value = "";
            });
            $(`textarea`).value = "";
        }
        var style = show ? `flex` : `none`;
        $(`.details`).style.display = style;
        $(`.add[type="${type}"]`).style.display = style;
    }
    /*
		shows adding menu and fills it with current product data
	*/
    updatingMenu() {
        $(`.details`).style.display = `flex`;
        $(`.add[type="product"]`).style.display = `flex`;
    }
    /*
		creates product in html format and puts it into the document
		* param {object} contains all product data that will be displayed
		?? @public
	*/
    createAndFillProduct(productData) {
        var product = document.createElement(`div`);
        product.classList.add(`footer__block`, `gap`);
        product.setAttribute(`id`, productData.id);
        product.innerHTML = `
			<div class="footer__title beet2">
				<p>${productData.Name}</p>
				<p>${productData.id}</p>
			</div>
			<div class="footer__price">
				${productData.Price}
				<span>USD</span>
			</div>
			<div class="footer__hide">
				${productData.Specs}
			</div>
			<div class="footer__hide">
				${productData.SupplierInfo}
			</div>
			<div class="footer__hide">
				${productData.MadeIn}
			</div>
			<div class="footer__hide">
				${productData.ProductionCompanyName}
			</div>
			<div class="footer__stars beet">
				${getStars(productData.Rating)}
			</div>
			<img src="../images/edit.png" alt="" class="footer__edit" />
			<div class="footer__clear center">
				<img src="../images/cross.png" alt="">
			</div>
		`;
        $(`.footer__blocko`).append(product);
        /*
			create stars
			* @param {number} number of stars images you want to create
			? @private
			! @returns {string} stars in html format
		*/
        function getStars(num) {
            var str = "";
            for (let i = 0; i < num; i++) {
                str += `<img src="../images/star.png" />`;
            }
            for (let i = 0; i < 5 - num; i++) {
                str += `<img src="../images/emptyStar.png"/>`;
            }
            return str;
        }
    }
    /*
		* @param {array} contains all stores data
		* @param {function} sets EventListener on storage click
		? @public
	*/
    fillStoresList(dataMass) {
				$(`.list__blocko`).innerHTML = ``;
				if (!dataMass) dataMass=model.Stores;
        dataMass.forEach((elem) => {
            var store = document.createElement(`div`);
            store.setAttribute(`id`, elem.id);
            store.classList.add(`list__content`);
            store.innerHTML = `<div class="list__line1 beet">
				<p class="list__big-title">${elem.Name}</p>
				<div>
					<p class="list__number">${elem.FloorArea}</p>
					<p class="list__small">sq.m</p>
				</div>
			</div>
			<div class="list__line2">${elem.Address}</div>`;
            store.addEventListener(`click`, () =>controller.toModel(`storageSelected`,store, elem));
            document.querySelector(`.list__blocko`).append(store);
        });
    }
    /*
		displays status of products
			* @param {array} contains Status of products
			? @public
		*/
    displayProductsStatus(products) {
        $(`.head__productNumber`).textContent = products.length;
        const status = {
            out: 0,
            storage: 0,
            ok: 0,
        };
        products.forEach((product) => {
            if (product.Status == `OK`) status.ok++;
            else if (product.Status == `OUT_OF_STOCK`) status.out++;
            else status.storage++;
        });
        $(`[type="storage"]`).textContent = status.storage;
        $(`[type="ok"]`).textContent = status.ok;
        $(`[type="out"]`).textContent = status.out;
    }
    /*
		shows all data of the selected storage
		* @param {array} contains data that will be inserted
	*/
    fillStoreContactData(mass) {
        var selectors = document
            .querySelectorAll(`[data]`)
            .forEach((elem, ind) => {
                elem.textContent = `:` + mass[ind];
            });
		}
		/*
			visualize selected storage
			? @public
		*/
		selectStorage() {
			$(`.list__content`, true).forEach((elem) => {
					if (+elem.getAttribute(`id`) == model.selectedStoreId)
							elem.classList.add(`selectedList`);
			});
		}
	/*
		removes selected styles of sort , group and input elements
		? @public
		* @param {string} styles of what we want to remove
		* @param {boolean} shows thar all styles should be removed
	*/
	removeStatus(status, activatedRemoveSort) {
		var process = {
				removeSort: (active) => {
						var elem = $(`.selectedSorter`);
						elem?.classList.remove(`selectedSorter`);
						if (!elem && !active) return;
						controller.toModel(`renderProducts`,`restore`);
						if (!active) process.removeInput();
				},
				removeGroup: () => {
						if (!$(`[content="All"]`).classList.contains(`activeSort`)) {
								$(`.activeSort`).classList.remove(`activeSort`);
								$(`[content="All"]`).classList.add(`activeSort`);
						}
				},
				removeInput: () => {
						model.activeInput = false;
						$(`.footer__input input`).value = "";
				}
		};
		if (status == `all`) {
				process.removeSort();
				process.removeInput();
				process.removeGroup();
		} else if (activatedRemoveSort) {
				process.removeSort(true);
		} else process[`remove${status}`]();
	}
	/*
		shows or hides storage details and products
		? @private
	*/
	displayProductList() {
		var mass = [`head`, `footer`, `buttons__button2`].forEach((elem) => {
				if (model.storeDetailsFilled)
						$(`.${elem}`).removeAttribute(`style`);
				else $(`.${elem}`).style.display = `none`;
		});
		if (model.storeDetailsFilled) $(`.nothing`).style.display = `none`;
		else $(`.nothing`).removeAttribute(`style`);
	}
	/*
		shows or hides full field data  of the product
		? @public
	*/
	displayOrDeleteProductFillData(event,display) {
		if (display) {
				const eve=event.target;
				var elem = document.createElement(`p`);
				elem.classList.add(`quickBar`);
				elem.textContent = eve.textContent;
				elem.style.top =
						eve.offsetTop + 25 - $(`main`).scrollTop + `px`;
				elem.style.left = eve.offsetLeft + 10 + `px`;
				$(`main`).append(elem);
		} else {
				$(`.quickBar`,true).forEach((elem) => {
					elem.remove();
				});
		}
	}
}
class Model {
		//data of product that is going to be deleted
		// ? @public
		deleteStatus = { type: "", id: null };
			//data of product that is going to be added
			// ? @public
		addStatus = { type: "", mass: {} };
			//data of product that is going to be updated
			// ? @private
		updateStatus = { mass: {}, id: null, active: false };
		/*array of product data
		 	@param normal -  all products of store
			@param grouped - are products selected by productStatus from !normal!
			@param input - are products selected from !group! by searching
			@param sorted - are products selected from !input! by sorting algorithm , has the same length as !input! but the sequence is different
		*/
		// ? @private
		currentProducts = { normal: [], sorted: [], grouped: [], input: [] };
		// id of store you have  selected
		// ? @public
		selectedStoreId = null;
		//status of grouping it was , it was done for better productivity
		// ? @private
		status = "";
		//if product list are open
		// ? @public
		storeDetailsFilled = false;
		//if products sorting by input is active
		// ? @public
		activeInput = false;
		//the data of all storages that are displayed
		// ? @public
    Stores = [];
    /*
		get , post ,delete , put information into database
		* @param {object} information which will interact with database contains : id {number} ,
		* mass {array} - data that fill be inserted into DB , text {string} - message that will decide what type of request will be
		! @returns {Promise}
		? @public
		*/
    requestIntoDataBase(objData) {
        var url,
            method = "GET",
            postData = {};
        var mass = [
            { text: `all stores`, url: `Stores`, method: "GET" },
            {
                text: `product list`,
                url: `Stores/${objData.id}/rel_Products`,
                method: "GET",
            },
            {
                text: `delete storage`,
                url: `Stores/${this.selectedStoreId}`,
                method: "DELETE",
            },
            {
                text: `delete product`,
                url: `/Products/${objData.id}`,
                method: "DELETE",
            },
            {
                text: `delete all products`,
                url: `Stores/${this.selectedStoreId}/rel_Products`,
                method: "DELETE",
            },
            { text: `add store`, url: `Stores`, method: "POST" },
            { text: `add product`, url: `Products`, method: "POST" },
            {
                text: `update product`,
                url: `Products/${objData.id}`,
                method: "PUT",
            },
        ].forEach((elem) => {
            if (objData.text == elem.text) {
                url = elem.url;
                method = elem.method;
            }
        });
        if (method == "POST" || method == "PUT") {
            postData = {
                body: JSON.stringify(objData.mass),
                headers: {
                    "Content-Type": "application/json",
                },
            };
        }
        return fetch(`http://localhost:3000/api/${url}`, {
            method: method,
            ...postData,
        });
    }
    /*
		sorts products of the selected storage
		* @param {string} sort descending or sort increasing
		* @param {string} column of table by which sorting will be
		? @public
		*/
    sortByOrder(type, column) {
        var mass = this.activeInput
            ? [...this.currentProducts.input]
            : [...this.currentProducts.grouped];
        mass.sort((obj1, obj2) => {
            if (type == "+" || type == `-`) {
                if (obj1[column] > obj2[column]) return 1;
                else if (obj1[column] == obj2[column]) return 0;
                else return -1;
            } else return obj1[column].localeCompare(obj2[column]);
        });
        if (type == `Z` || type == `-`) mass.reverse();
        this.renderProducts(`sort`, mass);
		}
		/*
			make a search among products
			* @param {string} data from input
			? @public
		*/
    searchProducts(text) {
        if (!text) return;
        var keys = [
            `Name`,
            `Price`,
            `Specs`,
            `Rating`,
            `SupplierInfo`,
            `MadeIn`,
            `ProductionCompanyName`,
        ];
        var mass = this.currentProducts.sorted.filter((elem) => {
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] == `Price` || keys[i] == `Rating`) {
                    if (elem[keys[i]] == text) return true;
                } else if (
                    elem[keys[i]].slice(0, text.length).toLowerCase() ==
                    text.toLowerCase()
                )
                    return true;
            }
            return false;
        });
        this.renderProducts(`input`, mass);
		}
		/*
			group products by their status
			* @param {string} type of grouping
			? @public
		*/
    sortByStatus(status) {
        if (status == `out of stock`) status = `OUT_OF_STOCK`;
        else if (status == `ok`) status = `OK`;
        else if (status == `storage`) status = `STORAGE`;
        else status = `All`;
        if (this.status == status) return;
        this.renderProducts(
            `group`,
            status == `All`
                ? this.currentProducts.normal
                : this.currentProducts.normal.filter(
                      (elem) => elem.Status == status
                  )
        );
        this.status = status;
		}
		/*
			search by store
			* @param {string} data from input
			? @public
		*/
    searchStore(input) {
        var input = view.input.value;
        var searchBy = +input ? `number` : `word`;
				var mass = [];
				this.Stores.forEach((elem) => {
					if (
							searchBy == `word` &&
							(getStartWords(elem, "Name") || getStartWords(elem, "Address"))
					)
							mass.push(elem);
					else if (elem.FloorArea == +input) mass.push(elem);
				});

				/*
					calculates if start of words are equal
					! returns {boolean}
					? @private
				*/
        function getStartWords(elem, column) {
            return (
                elem[column].slice(0, input.length).toLowerCase() ==
                input.toLowerCase()
            );
				}
				controller.toView(`fillStoresList`,input === `` ? null : mass);
				controller.toView(`selectStorage`);
    }
		/*
			fill Product data data in currentProduct mass
			* @param {string} type of filling data
			* @param {array} product data that will be filled
			? @private
		*/
			renderProducts(type, mass) {
					$(`.footer__blocko`).innerHTML = ``;
					var actions = {
							global: () => {
									this.currentProducts.normal = [];
									mass.forEach((productData) => {
											this.currentProducts.normal.push(productData);
											controller.toView(`createAndFillProduct`,productData);
									});
									const fast = [...this.currentProducts.normal];
									this.currentProducts.sorted = [...fast];
									this.currentProducts.grouped = [...fast];
							},
							restore: () => {
									this.currentProducts.sorted = [...this.currentProducts.grouped];
									this.currentProducts.sorted.forEach((productData) => {
											controller.toView(`createAndFillProduct`,productData);
									});
							},
							sort: () => {
									this.currentProducts.sorted = [];
									mass.forEach((productData) => {
											this.currentProducts.sorted.push(productData);
											controller.toView(`createAndFillProduct`,productData);
									});
							},
							input: () => {
									this.currentProducts.input = [];
									this.activeInput = true;
									mass.forEach((productData) => {
											this.currentProducts.input.push(productData);
											controller.toView(`createAndFillProduct`,productData);
									});
							},
							group: () => {
									this.currentProducts.grouped = [];
									mass.forEach((productData) => {
											this.currentProducts.grouped.push(productData);
											controller.toView(`createAndFillProduct`,productData);
									});
									this.currentProducts.sorted = [...this.currentProducts.grouped];
							},
					};
					actions[type]();
					controller.setProductTextDisplayers();
			}
		/*
			gets product or storage data from input field and checks if data is correct
			* @param {object} simple event object after clicking
			? @public
		*/
    readyToAddOrChangeProductsOrStorages(target) {
           const press = target.getAttribute(`press`),
            type = target.getAttribute(`type`),
            parent = $(`.add[type="${type}"]`);
        if (press == `cancel`) {
            this.addStatus = {};
						this.updateStatus = {};
						controller.toView(`addingMenu`,false,target.getAttribute(`type`))
        } else {
            var status;
            this.addStatus.mass = {};
            if (this.updateStatus.active) {
                fillFields(this.updateStatus);
                status = `update`;
                this.updateStatus.mass["StoreId"] = this.selectedStoreId;
                this.updateStatus.mass["Photo"] = "";
                this.updateStatus.mass["id"] = this.updateStatus.id;
            } else {
                fillFields(this.addStatus);
                if (type == `product`) {
                    this.addStatus.mass["StoreId"] = +this.selectedStoreId;
                    this.addStatus.mass["Photo"] = "";
                }
                status = `add`;
            }
            if (
                checkIfAllFieldsAreFilled(
                    this.updateStatus.active
                        ? this.updateStatus
                        : this.addStatus
                )
            ) return;
						this.addOrUpdate(status);
						controller.toView(`addingMenu`,false,target.getAttribute(`type`))
				}
				/*
					gets data from inputs
					* @param object that will be filled
					? @private
				*/
        function fillFields(obj) {
            obj.mass = {};
            parent.querySelectorAll(`.add__column`).forEach((source) => {
                var key = source.getAttribute(`key`),
                    value = getDataFromInput(source);
                obj.mass[key] =
                    key == `FloorArea` || key == "Price" || key == "Rating"
                        ? +value
                        : value;
            });
				}
				/*
					check if input of all inputs are not nullable
					? @private
					* @param {object} has a data object which will be checked
					! @returns {boolean} it is true when all inputs are filled
				*/
        function checkIfAllFieldsAreFilled(obj) {
            var isMistaken = false;
            Object.entries(obj.mass).forEach((elem) => {
                if (elem[1]) return;
                parent.querySelectorAll(`.add__column`).forEach((item) => {
                    if (item.getAttribute(`key`) != elem[0]) return;
                    item.children[1].classList.add(`incorrect`);
                    item.innerHTML += `<p class="mistake">enter value</p>`;
                    isMistaken = true;
                });
            });
            return isMistaken;
				}
				/*
					gives data from different types of input
					* @param {DOM element} input
					! @returns {string} value of the input
					? @private
				*/
        function getDataFromInput(source) {
            var input = source.querySelector(`input`),
                textarea = source.querySelector(`textarea`),
                select = source.querySelector(`select`);
            if (input) return input.value;
            else if (textarea) return textarea.value;
            else return select.value;
        }
        $(`.mistake`, true).forEach((elem) => {
            elem.previousElementSibling.classList.remove(`incorrect`);
            elem.remove();
        });
		}
		/*
			deletes storage or product
			? @public
		*/
		async delete() {
			const obj = this.deleteStatus;
			if (obj.type == `storage`) {
					await this.requestIntoDataBase({ text: `delete all products` });
					await this.requestIntoDataBase({
							text: `delete ${obj.type}`,
							id: obj.id,
					});
					this.createStores();
					this.storeDetailsFilled = false;
					controller.toView(`displayProductList`);
			} else {
					await this.requestIntoDataBase({
							text: `delete ${obj.type}`,
							id: obj.id,
					});
					controller.toView(`removeStatus`,`all`)
					this.storageSelected();
			}
			controller.toView(`info`,`${obj.type} has been deleted`);
			controller.toView(`displayOrDeleteProductFillData`)
		}
		/*
			create storages
			* @param {boolean} decides if product and info list should be displayed
			? @public
		*/
		async createStores(autoSelectStorage) {
			var result = await this.requestIntoDataBase({ text: `all stores` });
			this.Stores = await result.json();
			controller.toView(`fillStoresList`);
			if (autoSelectStorage) this.storageSelected();
		}
		/*
			adds or updates product
			* @param {string} decides to add or to update the product
			? @public
		*/
		async addOrUpdate(status) {
			var requestData;
			if (status == `add`) {
					const type = this.addStatus.type;
					requestData = {
							text: `add ${type}`,
							mass: this.addStatus.mass,
					};
					controller.toView(`info`,`new ${type} has been added`);
					this.addStatus = {};
			} else {
					requestData = {
							text: `update product`,
							mass: this.updateStatus.mass,
							id: this.updateStatus.id,
					};
					controller.toView(`info`,`new product has been updated`);
					this.updateStatus = {};
			}
			await this.requestIntoDataBase(requestData);
			controller.toView(`removeStatus`,`all`);
			this.createStores(true);
		}
		/*
			clears or edits data
			* @param {object} event object generated after click
			* @param {string} type of function clear or delete
			? @public
		*/
		setProductDelete(eve,type) {
			const id=+eve.currentTarget.parentElement.getAttribute(`id`);
			if (type==`clear`) {
					this.deleteStatus = {
						type: `product`,
						id: id
				};
				controller.toView(`deletingMenu`,true, `product`)
			} else {
					this.updateStatus.id = id;
					controller.toView(`updatingMenu`)
					this.currentProducts.normal.forEach((elem) => {
							if (elem.id == this.updateStatus.id) {
									$(`.add[type="product"] .add__column`).forEach(
											(column) => {
													column.children[1].value =
															elem[column.getAttribute(`key`)];
											}
									);
							}
					});
					this.updateStatus.active = true;
			}
		}
		/*
			happens when you select storage display all its data and its products
			* @param {DOM element} storeElement that was selected
			* @param {object} info of this store
			? @public
		*/
		async storageSelected(store, elem) {
			if (store && elem) {
					if (store.classList.contains(`selectedList`)) return;
					$(`.selectedList`)?.classList.remove(`selectedList`);
					this.selectedStoreId = +store.getAttribute(`id`);
			} else {
					store = $(`.list__content[id="${this.selectedStoreId}"]`);
					this.Stores.forEach((obj) => {
							if (obj.id == this.selectedStoreId) elem = obj;
					});
			}
			store.classList.add(`selectedList`);
			this.storeDetailsFilled = true;
			controller.toView(`displayProductList`);
			controller.toView(`fillStoreContactData`,[
				elem.Email,
				elem.PhoneNumber,
				elem.Address,
				elem.Established,
				elem.Established,
			])
			var result = await this.requestIntoDataBase({
					text: `product list`,
					id: elem.id,
			});
			var products = await result.json();
			this.renderProducts(`global`, products);
			controller.toView(`displayProductsStatus`,products)
		}
}
const model = new Model();
const view = new View();
const controller = new Controller();