window.okeReviewsWidgetOnInit = function () {
    moveSortSelect();
};

function moveSortSelect() {
    const sortSelect = document.querySelector('.okeReviews-reviews-controls-select');
    const headerControls = document.querySelector('.okeReviews-reviewsWidget-header-controls');
    if(sortSelect && headerControls) {
        headerControls.insertAdjacentElement('beforeend', sortSelect);
        sortSelect.style.visibility = "visible";
    }
}