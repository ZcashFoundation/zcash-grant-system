import React from 'react';
import './Banner.less'

const Banner = (props: any) => (
    <div className="Banner">
        <div className="Banner__inner">
            <div className="Banner__badge">
                <a href="#" className="Banner__link">{props.badgeName}</a>
            </div>
            <div className="Banner__body">
                <p className="Banner__body-text">{props.body}</p>
            </div>
        </div>
    </div>
)


export default Banner