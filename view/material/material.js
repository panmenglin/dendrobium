/**
 * material list
 */
const vscode = acquireVsCodeApi();
let intl = {};
let selectedWareHouse = {};

vscode.postMessage({ ready: true });

window.addEventListener('message', (event) => {
  const message = event.data;

  // tab
  if (message.library) {
    let tabs = '';
    message.library.map((item, index) => {
      tabs += `<div class="tabs-item" key="${index}">${
        item.title || item.name
      }</div>`;
    });

    console.log(tabs);
    
    $('#select').html(tabs);
    $('#selectedLibrary').html($('.select .tabs-item').eq(0).html());
    $('.select .tabs-item').eq(0).addClass('active').siblings().removeClass('active');

    $('.search input').show();

    // tab
    $('.tabs-item').click(function () {
      $('#selectedLibrary').html($(this).html());
      $(this).addClass('active').siblings().removeClass('active');
      $('.loading').show();

      selectedWareHouse = message.library[$(this).attr('key')];
      vscode.postMessage({ warehouseSelected: selectedWareHouse });
    });
  }

  if (message.intl) {
    intl = message.intl;

    $('.search input').attr('placeholder', intl['searchPlaceholder']);
  }

  // block
  if (message.components) {
    let blocks = message.components;

    // blocks = JSON.parse(JSON.stringify(blocks));
    // console.log(12121212);
    // console.log(blocks);

    // console.log(blocks);
    // // blocks.map((item, index) => {
    // //   item.title = `${item.title}${index}`;
    // // });

    blockListRender(blocks);
    bindSearch(blocks);
  }
});

/**
 * search
 * @param {*} blocks
 */
function bindSearch(blocks) {
  $('#keyword').keyup(function () {
    const keyword = $(this).val();
    const keywordRegExp = new RegExp(keyword, 'i');

    const filterBlocks = blocks.filter((item) => {
      return item.title.indexOf(keyword) >= 0 || keywordRegExp.test(item.tags);
    });

    blockListRender(filterBlocks);
  });
}

/**
 * view render
 * @param {*} blocks
 */
function blockListRender(blocks) {
  console.log('blocks', blocks);

  // pagination
  let pageNo = 1;
  const pageSize = 2;
  let maxPageNo = Math.ceil(blocks.length / pageSize);

  let pagination =
    maxPageNo > 1
      ? `<div class="op-prev">${intl['previousPage'] || '上一页'}</div>`
      : '';

  for (let index = 0; index < maxPageNo; index++) {
    pagination += `<div class="op-pager" pageNo="${index + 1}">${
      index + 1
    }</div>`;
  }

  pagination +=
    maxPageNo > 1
      ? `<div class="op-next">${intl['nextPage'] || '下一页'}</div>`
      : '';

  $('.pagination').html(pagination);
  $('.op-pager').eq(0).addClass('cur');

  $('.op-prev').click(function () {
    if (pageNo > 1) {
      pageNo--;
      pageNoChange(pageNo);
    }
  });

  $('.op-next').click(function () {
    if (pageNo < maxPageNo) {
      pageNo++;
      pageNoChange(pageNo);
    }
  });

  $('.op-pager').click(function () {
    pageNo = $(this).attr('pageNo');
    pageNoChange(pageNo);
  });

  function pageNoChange(pageNo) {
    $('.op-pager')
      .eq(pageNo - 1)
      .addClass('cur')
      .siblings()
      .removeClass('cur');
    renderPageList();
  }

  renderPageList();
  function renderPageList() {
    let list = '';
    const beginIndex = (pageNo - 1) * pageSize;

    blocks.slice(beginIndex, pageNo * pageSize).map((item, index) => {
      let tags = '';
      if (item.tags) {
        item.tags.map((tag) => {
          tags += `<span class="tag-item">${tag}</span>`;
        });
      }

      item.like = true;

      list += `<div class="block-item">
                      <div class="block-title">${
                        item.title
                      }<div class="block-star">
                        <svg t="1620972750303" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7819" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16">
                            <path d="M749.624889 980.152889a95.601778 95.601778 0 0 1-45.084445-11.306667l-192.526222-103.637333-192.469333 103.608889c-31.203556 16.64-70.314667 14.392889-99.043556-5.304889-29.511111-20.337778-44.743111-55.921778-38.840889-90.695111l37.703112-225.251556-162.702223-162.474666c-25.002667-24.888889-33.464889-60.984889-22.058666-94.193778 11.349333-32.910222 40.064-56.576 74.965333-61.752889l221.326222-32.896 96.128-199.580445c15.488-32.085333 48.853333-52.807111 84.992-52.807111 36.167111 0 69.518222 20.736 84.963556 52.807111l96.156444 199.580445 221.297778 32.910222c34.872889 5.162667 63.616 28.8 74.979556 61.696a90.666667 90.666667 0 0 1-22.030223 94.250667L804.622222 647.566222l37.745778 225.28c5.845333 34.773333-9.386667 70.357333-38.812444 90.638222a95.274667 95.274667 0 0 1-53.930667 16.668445zM512.014222 804.451556c4.636444 0 9.272889 1.137778 13.482667 3.384888l205.937778 110.862223a39.253333 39.253333 0 0 0 39.936-2.133334c11.392-7.836444 17.123556-21.006222 14.890666-34.304L746.097778 642.503111a28.472889 28.472889 0 0 1 7.964444-24.832l173.141334-172.842667a34.147556 34.147556 0 0 0 8.405333-35.484444c-4.380444-12.672-15.701333-21.873778-29.525333-23.921778L669.866667 350.293333a28.430222 28.430222 0 0 1-21.447111-15.786666L545.720889 121.358222c-6.030222-12.529778-19.256889-20.608-33.706667-20.608s-27.690667 8.092444-33.763555 20.622222L375.608889 334.506667a28.430222 28.430222 0 0 1-21.447111 15.786666L117.930667 385.422222c-13.624889 2.033778-25.201778 11.434667-29.539556 23.992889-4.266667 12.416-1.024 25.984 8.433778 35.399111L269.937778 617.671111c6.513778 6.499556 9.472 15.744 7.964444 24.832l-40.135111 239.744c-2.247111 13.312 3.484444 26.439111 14.976 34.360889 11.434667 7.836444 27.349333 8.775111 39.950222 2.062222l205.852445-110.833778c4.195556-2.247111 8.832-3.384889 13.468444-3.384888z" p-id="7820" fill="${
                              item.like ? '#FFB531' : '#e6e6e6'
                            }"></path>
                            <path d="M200.32 456.789333a14.236444 14.236444 0 0 1-2.261333-28.259555l9.443555-1.536a14.136889 14.136889 0 0 1 16.312889 11.761778 14.222222 14.222222 0 0 1-11.761778 16.312888l-9.443555 1.536a13.809778 13.809778 0 0 1-2.289778 0.184889z m52.224-8.476444a14.222222 14.222222 0 0 1-2.673778-28.188445l153.927111-29.696 58.055111-133.148444a14.222222 14.222222 0 1 1 26.083556 11.363556l-61.056 140.017777a14.222222 14.222222 0 0 1-10.353778 8.277334l-161.28 31.118222a13.468444 13.468444 0 0 1-2.702222 0.256z" p-id="7821" fill="${
                              item.like ? '#FFB531' : '#e6e6e6'
                            }"></path>
                        </svg>
                        12
                      </div>
                      </div>
                      <p class="block-desc">${item.description}</p>
                      <p class="block-author">开发者：${item.author}</p>
                      <div class="tags"> ${tags} </div>
                      ${
                        item.img
                          ? `<div class="block-snapshot"> <img src="${item.img}"/> </div>`
                          : ''
                      }
                      <div class="block-operation">
                          <a href="javascript:;" class="op-add" itemIndex="${
                            beginIndex + index
                          }">${intl['add'] || '添加'}</a>   
                          <a href="${
                            item.previewUrl || item.url
                          }" target="_blank">${intl['preview'] || '文档'}</a>
                      </div>
                  </div>`;
    });

    $('#blockContainer').html(list);

    $('.loading').hide();

    // block click
    $('.op-add').click(function () {
      const itemIndex = $(this).attr('itemIndex');
      const selected = blocks[itemIndex];
      selected.warehouse = selectedWareHouse;

      // if (selected.type === "npm") {
      //   $(".shadow").show();

      //   // insert project
      //   $("#leftButton")
      //     .off()
      //     .click(function () {
      //       vscode.postMessage({
      //         blockSelected: {
      //           ...selected,
      //           type: "snippet",
      //         },
      //       });

      //       $(".shadow").hide();
      //     });

      //   // as npm dependencies
      //   $("#rightButton")
      //     .off()
      //     .click(function () {
      //       vscode.postMessage({ blockSelected: selected });

      //       $(".shadow").hide();
      //     });
      // } else {
      vscode.postMessage({ blockSelected: selected });
      // }
    });

    $('#close').click(function () {
      $('.shadow').hide();
    });
  }
}
