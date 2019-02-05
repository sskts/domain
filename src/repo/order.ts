import { repository } from '@cinerino/domain';

import * as factory from '../factory';

/**
 * 注文リポジトリ
 */
export class MongoRepository extends repository.Order {
    /**
     * イベント場所と予約番号から検索する
     */
    public async findByLocationBranchCodeAndReservationNumber(
        orderInquiryKey: factory.order.IOrderInquiryKey
    ): Promise<factory.order.IOrder> {
        const doc = await this.orderModel.findOne(
            {
                'acceptedOffers.itemOffered.reservationFor.superEvent.location.branchCode': {
                    $exists: true,
                    $eq: orderInquiryKey.theaterCode
                },
                'acceptedOffers.itemOffered.reservationNumber': {
                    $exists: true,
                    $eq: orderInquiryKey.confirmationNumber.toString()
                },
                'customer.telephone': {
                    $exists: true,
                    $eq: orderInquiryKey.telephone
                }
            }
        ).exec();

        if (doc === null) {
            throw new factory.errors.NotFound('order');
        }

        return doc.toObject();
    }
}
