import { createItem } from '../api/data.js';
import { html } from '../lib.js';


const createTemplate = (onSubmit, errorMsg, errors) => html `<div class="row space-top">
    <div class="col-md-12">
        <h1>Create New Furniture</h1>
        <p>Please fill all fields.</p>
    </div>
</div>
<form @submit=${onSubmit}>
    ${errorMsg ? html`<div class="form-group error">${errorMsg}</div>` : null}
    <div class="row space-top">
        <div class="col-md-4">

            <div class="form-group">
                <label class="form-control-label" for="new-make">Make</label>
                <input class=${'form-control' + (errors.make ? ' is-invalid' : '')} id="new-make" type="text"
                    name="make">
            </div>
            <div class="form-group has-success">
                <label class="form-control-label" for="new-model">Model</label>
                <input class=${'form-control' + (errors.model ? ' is-invalid' : '')} id="new-model" type="text"
                    name="model">
            </div>
            <div class="form-group has-danger">
                <label class="form-control-label" for="new-year">Year</label>
                <input class=${'form-control' + (errors.year ? ' is-invalid' : '')} id="new-year" type="number"
                    name="year">
            </div>
            <div class="form-group">
                <label class="form-control-label" for="new-description">Description</label>
                <input class=${'form-control' + (errors.description ? ' is-invalid' : '')} id="new-description"
                    type="text" name="description">
            </div>
        </div>
        <div class="col-md-4">
            <div class="form-group">
                <label class="form-control-label" for="new-price">Price</label>
                <input class=${'form-control' + (errors.price ? ' is-invalid' : '')} id="new-price" type="number"
                    name="price">
            </div>
            <div class="form-group">
                <label class="form-control-label" for="new-image">Image</label>
                <input class=${'form-control' + (errors.img ? ' is-invalid' : '')} id="new-image" type="text"
                    name="img">
            </div>
            <div class="form-group">
                <label class="form-control-label" for="new-material">Material (optional)</label>
                <input class="form-control" id="new-material" type="text" name="material">
            </div>
            <input type="submit" class="btn btn-primary" value="Create" />
        </div>
    </div>
</form>`;

export function createPage(ctx) {
    update(null, {});

    function update(errorMsg, errors) {
        ctx.render(createTemplate(onSubmit, errorMsg, errors));
    }

    async function onSubmit(event) {
        event.preventDefault();
        const formData = [...(new FormData(event.target)).entries()];
        const data = formData.reduce((a, [k, v]) => Object.assign(a, { [k]: v.trim() }), {});

        const missing = formData.filter(([k, v]) => k != 'material' && v.trim() == '');

        try {
            if (missing.length > 0) {
                const errors = missing.reduce((a, [k]) => Object.assign(a, { [k]: true }), {});
                throw {
                    error: new Error('Please fill in the mandantory fields!'),
                    errors
                };
            }
            data.year = Number(data.year);
            data.price = Number(data.price);

            if (data.make.length < 4) {
                throw new Error('Make must be at least 4 symbols long');
            }
            if (data.model.length < 4) {
                throw new Error('Model must be at least 4 symbols long');
            }
            if (data.year < 1950 || data.year > 2050) {
                throw new Error('Year must be between 1950 and 2050');
            }
            if (data.description.length < 11) {
                throw new Error('Description must be more than 10 symbols');
            }
            if (data.price < 0) {
                throw new Error('Price must be a positive number');
            }
            /*Image URL is required*/
            /*if (!((data.img).endsWith('.jpg') || (data.img).endsWith('.jpeg')
                || (data.img).endsWith('.gif') || (data.img).endsWith('.png')
                || (data.img).endsWith('.tiff') ||(data.img).endsWith('.bmp'))) {
                throw new Error('Image URL is required');
            }*/
            if (!(data.img).match(/\w+\.(jpg|jpeg|gif|png|tiff|bmp)$/gi)) {
                throw new Error('Image URL is required and must ends with jpg|jpeg|gif|png|tiff|bmp');
            }

            const result = await createItem(data);
            event.target.reset();
            ctx.page.redirect('/details/' + result._id)
        } catch (err) {
            const message = err.message || err.error.message
            update(message, err.errors || {});
        }
    }
}